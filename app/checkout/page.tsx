"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Tag, Check } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { useCatalog, usePayments, usePricing } from "@/components/catalog/catalog-provider";
import { getCartTotals } from "@/lib/cart-totals";
import { couponDiscount, enabledPaymentMethods, getShippingMethods, shippingFee, type PaymentMethodId, type ShippingMethodId } from "@/lib/pricing";
import { GOVERNORATES } from "@/lib/egypt";
import { PaymentInstructions } from "@/components/checkout/payment-instructions";
import { placeOrder as placeOrderAction, validateCoupon } from "./actions";

const PAYMENT_LABELS: Record<PaymentMethodId, { label: string; hint: string }> = {
  cod: { label: "Cash On Delivery", hint: "Pay in cash when your order arrives" },
  instapay: { label: "InstaPay", hint: "Instant bank transfer, confirmed by our team" },
  wallet: { label: "Mobile Wallet", hint: "Vodafone Cash, Orange Cash and others" },
};

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);
  const clearCart = useCartStore((state) => state.clear);
  const catalog = useCatalog();
  const pricing = usePricing();
  const shippingMethods = getShippingMethods(pricing);
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const payments = usePayments();
  const availableMethods = enabledPaymentMethods(payments);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [selectedMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");
  // Fall back to the first offered method if the chosen one was switched off in settings.
  const paymentMethod = availableMethods.includes(selectedMethod) ? selectedMethod : (availableMethods[0] ?? "cod");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
  } | null>(null);

  const { items: detailed, subtotal, count } = getCartTotals(items, catalog, pricing);

  if (items.length === 0) {
    return (
      <Container>
        <section className="py-24">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
            <h1
              className="text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your cart is empty.
            </h1>

            <p className="mt-5 max-w-md leading-8 text-neutral-500">
              Add a few pieces before checking out.
            </p>

            <Link
              href="/men"
              className="mt-10 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </Container>
    );
  }

  const shippingCost = shippingFee(subtotal, shippingMethod, pricing);

  const discount = appliedCoupon ? couponDiscount(subtotal, appliedCoupon) : 0;

  const total = subtotal - discount + shippingCost;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;

    const result = await validateCoupon(coupon, subtotal);

    if (result?.ok) {
      setAppliedCoupon(result);
      toast.success("Coupon applied", { description: result.code });
    } else {
      toast.error(result?.error ?? "Too many attempts, try again later");
    }
  };

  const submitOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "");

    startTransition(async () => {
      const result = await placeOrderAction({
        email: field("email"),
        phone: field("phone"),
        firstName: field("firstName"),
        lastName: field("lastName"),
        governorate: field("governorate"),
        city: field("city"),
        postal: field("postal"),
        address: field("address"),
        notes: field("notes"),
        website: field("website"),
        shippingMethod,
        paymentMethod,
        paymentSender: field("paymentSender"),
        paymentReference: field("paymentReference"),
        coupon: appliedCoupon?.code,
        items: items.map(({ productId, colorId, size, quantity }) => ({ productId, colorId, size, quantity })),
      });

      if (result.ok) {
        clearCart();
        setRedirecting(true);
        router.push(result.confirmUrl);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Container>
      <section className="py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Checkout
          </span>

          <h1
            className="mt-4 text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Complete Your Order
          </h1>
        </div>

        <form onSubmit={submitOrder} className="grid gap-16 lg:grid-cols-[1fr_400px]">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {/* Left: form */}

          <div className="space-y-12">
            {/* Contact */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Contact Information</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Email (optional)" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                <Input label="Phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="01012345678" />
              </div>
            </div>

            {/* Shipping address */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Shipping Address</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="First Name" name="firstName" required autoComplete="given-name" placeholder="First name" />
                <Input label="Last Name" name="lastName" required autoComplete="family-name" placeholder="Last name" />
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="governorate" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Governorate (we deliver across Egypt)
                  </label>
                  <select
                    id="governorate"
                    name="governorate"
                    required
                    defaultValue=""
                    autoComplete="address-level1"
                    className="h-12 rounded-xl border border-neutral-300 bg-surface px-4 text-sm focus:border-foreground focus:outline-none"
                  >
                    <option value="" disabled>Select your governorate</option>
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <Input label="City / Area" name="city" required autoComplete="address-level2" placeholder="e.g. Nasr City" />
                <Input label="Postal Code (optional)" name="postal" autoComplete="postal-code" inputMode="numeric" placeholder="11511" />
                <Input label="Address" name="address" required autoComplete="street-address" placeholder="Street, building, apartment" className="sm:col-span-2" />
              </div>
            </div>

            {/* Shipping method */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Shipping Method</h2>

              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setShippingMethod(method.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                      shippingMethod === method.id
                        ? "border-foreground"
                        : "border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-neutral-500">{method.detail}</p>
                    </div>

                    <span className="text-sm font-medium">
                      {method.id === "standard" && subtotal >= pricing.freeShippingThreshold ? "Free" : `EGP ${method.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Payment Method</h2>

              <div className="space-y-3">
                {availableMethods.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    aria-pressed={paymentMethod === id}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                      paymentMethod === id ? "border-foreground" : "border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === id ? "border-foreground" : "border-neutral-300"}`}>
                      {paymentMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                    </span>
                    <span>
                      <span className="block font-medium">{PAYMENT_LABELS[id].label}</span>
                      <span className="block text-sm text-neutral-500">{PAYMENT_LABELS[id].hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              {paymentMethod !== "cod" && (
                <div className="mt-6 space-y-5">
                  <PaymentInstructions method={paymentMethod} config={payments} total={total} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Sent from (phone or InstaPay address)" name="paymentSender" required minLength={4} autoComplete="off" placeholder="01xxxxxxxxx" />
                    <Input label="Transfer reference number" name="paymentReference" required minLength={4} autoComplete="off" placeholder="From your confirmation" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: summary */}

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-semibold">Order Summary</h2>

              <div className="mt-6 space-y-5">
                {detailed.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.colorId}`} className="flex gap-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          {item.colorName} · {item.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-full border">
                          <button
                            type="button"
                            onClick={() => decrease(item.productId, item.colorId, item.size)}
                            className="flex h-8 w-8 items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-8 text-center text-sm">{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => increase(item.productId, item.colorId, item.size)}
                            className="flex h-8 w-8 items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className="text-sm font-medium">
                          EGP {item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}

              <div className="mt-6 border-t border-neutral-200 pt-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Check size={16} className="text-foreground" />
                      {appliedCoupon.code} — {appliedCoupon.type === "PERCENT" ? `${appliedCoupon.value}%` : `EGP ${appliedCoupon.value}`} off
                    </span>

                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs uppercase tracking-[0.18em] text-neutral-500 hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      name="coupon"
                      placeholder="Coupon code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyCoupon();
                        }
                      }}
                      className="h-11"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={applyCoupon}
                      aria-label="Apply coupon"
                    >
                      <Tag size={16} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Totals */}

              <div className="mt-6 space-y-4 border-t border-neutral-200 pt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal ({count})</span>
                  <span>EGP {subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-neutral-500">
                    <span>Discount</span>
                    <span>- EGP {discount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `EGP ${shippingCost}`}</span>
                </div>

                <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-semibold">
                  <span>Total</span>
                  <span>EGP {total.toFixed(0)}</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || redirecting}>
                {pending || redirecting ? "Placing order…" : paymentMethod === "cod" ? "Place Order" : "Confirm Order & Payment"}
              </Button>

              <p className="mt-4 text-center text-xs text-neutral-500">
                {paymentMethod === "cod"
                  ? "Pay in cash when your order arrives."
                  : "Your order is prepared as soon as we confirm your transfer."}
              </p>
            </div>
          </aside>
        </form>
      </section>
    </Container>
  );
}
