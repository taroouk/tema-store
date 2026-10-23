import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PaymentInstructions } from "@/components/checkout/payment-instructions";
import { ProofUploader } from "@/components/checkout/proof-uploader";
import { Container } from "@/components/common/container";
import { prisma } from "@/lib/prisma/client";
import { getSettings } from "@/lib/settings";
import { verifyToken } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_TEXT: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const PAYMENT_TEXT: Record<string, string> = {
  UNPAID: "Pay on delivery",
  AWAITING_VERIFICATION: "Payment received — awaiting our confirmation",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "We could not verify your payment — please contact us",
};

/** Permanent order page, reachable only with the signed link we give the customer (also emailed). */
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { number } = await params;
  const { t } = await searchParams;
  const n = z.coerce.number().int().positive().max(2_000_000_000).safeParse(number);
  if (!n.success) notFound();

  const order = await prisma.order.findUnique({ where: { number: n.data }, include: { items: true } });
  if (!order || !verifyToken("order", `${order.number}:${order.email}`, t)) notFound();

  const settings = await getSettings();
  const transfer = order.paymentMethod === "INSTAPAY" || order.paymentMethod === "WALLET";
  const needsPayment = transfer && !["PAID", "REFUNDED"].includes(order.paymentStatus) && !["CANCELLED", "REFUNDED"].includes(order.status);
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <Container>
      <section className="mx-auto max-w-2xl py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Order #{order.number}</p>
        <h1 className="mt-3 text-4xl md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
          Thank you, {order.customerName.split(" ")[0]}.
        </h1>
        <p className="mt-4 leading-8 text-neutral-600">
          Your order has been received. We&apos;ve emailed a copy to <strong className="text-foreground">{order.email}</strong> — keep this page
          bookmarked to follow your order.
        </p>

        <div className="mt-8 grid gap-3 rounded-2xl bg-neutral-100 p-5 text-sm sm:grid-cols-2">
          <p><span className="text-neutral-500">Status · </span><strong>{STATUS_TEXT[order.status] ?? order.status}</strong></p>
          <p><span className="text-neutral-500">Payment · </span><strong>{order.paymentMethod === "COD" && order.paymentStatus === "UNPAID" ? "Cash on delivery" : (PAYMENT_TEXT[order.paymentStatus] ?? order.paymentStatus)}</strong></p>
        </div>

        {needsPayment && (
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold">Complete your payment</h2>
            <PaymentInstructions method={order.paymentMethod === "INSTAPAY" ? "instapay" : "wallet"} config={settings.payments} total={Number(order.total)} />
            <p className="text-sm text-neutral-600">
              We already have your transfer reference <strong className="font-mono text-foreground">{order.paymentReference}</strong>. A screenshot of the transfer helps us confirm it faster.
            </p>
            <ProofUploader number={order.number} email={order.email} />
          </div>
        )}

        <h2 className="mt-12 text-xl font-semibold">Items</h2>
        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <span>
                {i.name} <span className="text-neutral-500">· {i.color} / {i.size} × {i.quantity}</span>
              </span>
              <span>EGP {(Number(i.unitPrice) * i.quantity).toLocaleString("en-US")}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-neutral-500">Shipping</dt><dd>EGP {Number(order.shippingFee).toLocaleString("en-US")}</dd></div>
          {Number(order.discount) > 0 && <div className="flex justify-between"><dt className="text-neutral-500">Discount</dt><dd>-EGP {Number(order.discount).toLocaleString("en-US")}</dd></div>}
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>EGP {Number(order.total).toLocaleString("en-US")}</dd></div>
        </dl>

        <p className="mt-8 text-sm text-neutral-600">
          Delivering to {[addr.address, addr.city, addr.governorate].filter(Boolean).join(", ")} · {order.phone}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/men" className="rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:opacity-90">
            Continue shopping
          </Link>
          <Link href="/contact" className="rounded-full border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition hover:border-foreground">
            Need help?
          </Link>
        </div>
      </section>
    </Container>
  );
}
