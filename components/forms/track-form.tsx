"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProofUploader } from "@/components/checkout/proof-uploader";
import { trackOrder } from "@/lib/forms/actions";

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "Pay on delivery",
  AWAITING_VERIFICATION: "Payment received — awaiting confirmation",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Payment could not be verified",
};
const LABELS: Record<string, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function TrackForm() {
  const [state, action, pending] = useActionState(trackOrder, null);
  const order = state?.order;
  const step = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form action={action} className="space-y-5 rounded-3xl border border-neutral-200 p-8">
        <Input label="Order number" name="number" required inputMode="numeric" placeholder="e.g. 1042" defaultValue={state?.values?.number} />
        <Input label="Phone number or email used at checkout" name="contact" required autoComplete="tel" placeholder="01012345678 or you@example.com" defaultValue={state?.values?.contact} />
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 size={16} className="mr-2 animate-spin" />}
          Track Order
        </Button>
      </form>

      {order && (
        <section aria-live="polite" className="rounded-3xl border border-neutral-200 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Order #{order.number}</p>
          <h2 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
            {LABELS[order.status] ?? order.status}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
          </p>

          <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm">
            <span className="text-neutral-500">Payment · </span>
            <strong>
              {order.paymentMethod === "COD" && order.paymentStatus === "UNPAID"
                ? "Cash on delivery"
                : (PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus)}
            </strong>
          </p>
          {(order.paymentMethod === "INSTAPAY" || order.paymentMethod === "WALLET") &&
            !["PAID", "REFUNDED"].includes(order.paymentStatus) &&
            !["CANCELLED", "REFUNDED"].includes(order.status) && (
              <div className="mt-4">
                <ProofUploader number={order.number} contact={order.contact} compact />
              </div>
            )}

          {step >= 0 && (
            <ol className="mt-8 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i <= step ? "bg-foreground text-background" : "bg-neutral-200 text-neutral-500"}`}>
                    {i + 1}
                  </span>
                  <span className={i <= step ? "font-medium" : "text-neutral-500"}>{LABELS[s]}</span>
                </li>
              ))}
            </ol>
          )}

          <ul className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200 text-sm">
            {order.items.map((i, n) => (
              <li key={n} className="flex justify-between py-3">
                <span>
                  {i.name} <span className="text-neutral-500">· {i.color} / {i.size}</span>
                </span>
                <span>× {i.quantity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-neutral-200 pt-4 font-semibold">
            <span>Total</span>
            <span>
              {order.currency} {order.total.toLocaleString("en-US")}
            </span>
          </p>
        </section>
      )}
    </div>
  );
}
