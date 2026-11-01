"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { CATALOG_TAG } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth/session";
import { notifyOrderStatus, type StatusEvent } from "@/lib/notify";
import { releaseOrderStock } from "@/lib/orders/release";
import { prisma } from "@/lib/prisma/client";

const Update = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  paymentStatus: z.enum(["UNPAID", "AWAITING_VERIFICATION", "PAID", "REFUNDED", "FAILED"]),
  internalNote: z.string().max(2000).optional(),
});

export async function updateOrder(id: string, formData: FormData) {
  const admin = await requireAdmin("orders:manage");
  const back = `/admin/orders/${id}`;
  const parsed = Update.safeParse({
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    internalNote: formData.get("internalNote") || undefined,
  });
  if (!parsed.success) redirect(withMessage(back, "error", "Invalid input"));

  let event: StatusEvent | null = null;
  let recipient: { id: string; number: number; email: string | null; customerName: string } | null = null;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });

    // Stock is reserved at checkout, so cancelling/refunding returns it exactly once.
    const releases = ["CANCELLED", "REFUNDED"];
    if (releases.includes(parsed.data.status) && !releases.includes(order.status)) {
      await releaseOrderStock(tx, order);
    }

    if (parsed.data.status !== order.status && ["SHIPPED", "DELIVERED", "CANCELLED"].includes(parsed.data.status)) {
      event = parsed.data.status as StatusEvent;
    } else if (parsed.data.paymentStatus === "PAID" && order.paymentStatus !== "PAID") {
      event = "PAYMENT_CONFIRMED";
    }
    recipient = { id: order.id, number: order.number, email: order.email, customerName: order.customerName };

    await tx.order.update({
      where: { id },
      data: { ...parsed.data, paidAt: parsed.data.paymentStatus === "PAID" ? (order.paidAt ?? new Date()) : order.paidAt },
    });
    await audit(admin, {
      action: "update",
      entity: "Order",
      entityId: id,
      summary: `Order #${order.number}: ${order.status} → ${parsed.data.status}, payment ${parsed.data.paymentStatus}`,
    });
  });

  if (event && recipient) {
    const [r, e] = [recipient, event];
    after(() => notifyOrderStatus(r, e).catch((err) => console.error("[notify] status", err)));
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/orders");
  redirect(withMessage(back, "ok", "Order updated"));
}

/** Marks a transfer as received and moves a brand-new order forward. */
export async function confirmPayment(id: string) {
  const admin = await requireAdmin("orders:manage");
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: "PAID",
      paidAt: new Date(),
      status: order.status === "PENDING" ? "CONFIRMED" : order.status,
    },
  });
  if (order.paymentStatus !== "PAID") {
    after(() => notifyOrderStatus(order, "PAYMENT_CONFIRMED").catch((err) => console.error("[notify] payment", err)));
  }
  await audit(admin, { action: "payment", entity: "Order", entityId: id, summary: `Order #${order.number}: payment confirmed (${order.paymentMethod}, ref ${order.paymentReference ?? "n/a"})` });
  revalidatePath("/admin/orders");
  redirect(withMessage(`/admin/orders/${id}`, "ok", "Payment confirmed"));
}

/** The transfer could not be found / doesn't match: flag it so support can follow up. */
export async function rejectPayment(id: string) {
  const admin = await requireAdmin("orders:manage");
  const order = await prisma.order.update({ where: { id }, data: { paymentStatus: "FAILED" } });
  await audit(admin, { action: "payment", entity: "Order", entityId: id, summary: `Order #${order.number}: payment could not be verified` });
  revalidatePath("/admin/orders");
  redirect(withMessage(`/admin/orders/${id}`, "ok", "Payment marked as not received"));
}

/** Deletes an order for good. Stock is given back first unless the order was already cancelled/refunded. */
export async function deleteOrder(id: string) {
  const admin = await requireAdmin("orders:manage");
  const number = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    if (!["CANCELLED", "REFUNDED"].includes(order.status)) await releaseOrderStock(tx, order);
    await tx.order.delete({ where: { id } });
    return order.number;
  });
  await audit(admin, { action: "delete", entity: "Order", entityId: id, summary: `Deleted order #${number}` });
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/orders");
  redirect(withMessage("/admin/orders", "ok", `Order #${number} deleted`));
}
