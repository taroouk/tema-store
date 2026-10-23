import { timingSafeEqual } from "node:crypto";

import { siteConfig } from "@/constants/site";
import { sendEmail, sendTelegram } from "@/lib/notify";
import { prisma } from "@/lib/prisma/client";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Daily reminder about InstaPay / wallet orders that are still waiting for you to confirm the payment.
 * (Stock stays reserved for them, so a forgotten transfer would otherwise hold stock indefinitely.)
 *
 * Call it once a day from any scheduler:  GET /api/cron/transfer-reminders  with header
 *   Authorization: Bearer <CRON_SECRET>      (Vercel Cron sends exactly this)
 * Nothing is cancelled automatically — a late payment must never lose a customer their order.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Disabled: CRON_SECRET is not set", { status: 503 });

  const given = Buffer.from(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const settings = await getSettings();
  const cutoff = new Date(Date.now() - settings.unpaidHoldHours * 3_600_000);
  const stale = await prisma.order.findMany({
    where: {
      paymentMethod: { in: ["INSTAPAY", "WALLET"] },
      paymentStatus: { in: ["AWAITING_VERIFICATION", "UNPAID"] },
      status: { notIn: ["CANCELLED", "REFUNDED", "DELIVERED"] },
      createdAt: { lt: cutoff },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { number: true, customerName: true, total: true, paymentReference: true, createdAt: true },
  });

  if (stale.length) {
    const lines = [
      `⏰ ${stale.length} transfer order${stale.length === 1 ? "" : "s"} waiting for payment confirmation for more than ${settings.unpaidHoldHours}h:`,
      ...stale.map((o) => `• #${o.number} ${o.customerName} — EGP ${Number(o.total)} (ref ${o.paymentReference ?? "n/a"})`),
      `Confirm or cancel them: ${siteConfig.url}/admin/orders?pay=verify`,
    ];
    const to = process.env.ORDER_NOTIFY_EMAIL || settings.supportEmail;
    await Promise.allSettled([
      to ? sendEmail({ to, subject: `${stale.length} transfer order(s) need your attention`, html: `<pre style="font:14px/22px Arial;white-space:pre-wrap">${lines.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`, text: lines.join("\n") }) : Promise.resolve(false),
      sendTelegram(lines.join("\n")),
    ]);
  }

  return Response.json({ stale: stale.length });
}
