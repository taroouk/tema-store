"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Tag, Check } from "lucide-react";
import { toast } from "sonner";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart-store";
import { getCartTotals, FREE_SHIPPING_THRESHOLD } from "@/lib/cart-totals";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", detail: "2–4 business days", price: 80 },
  { id: "express", label: "Express Delivery", detail: "Next day", price: 150 },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "cod", label: "Cash On Delivery" },
];

const COUPONS: Record<string, number> = {
  TEMA10: 0.1,
  WELCOME15: 0.15,
};

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const increase = useCartStore((state) => state.increase);
  const decrease = useCartStore((state) => state.decrease);

  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    rate: number;
  } | null>(null);

  const { items: detailed, subtotal, count } = getCartTotals(items);

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
              className="mt-10 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </Container>
    );
  }

  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod === "standard"
      ? 0
      : SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price ?? 0;

  const discount = appliedCoupon ? subtotal * appliedCoupon.rate : 0;

  const total = subtotal - discount + shippingCost;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (!code) return;

    const rate = COUPONS[code];

    if (rate) {
      setAppliedCoupon({ code, rate });
      toast.success("Coupon applied", { description: `${code} — ${rate * 100}% off` });
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const placeOrder = () => {
    toast.success("Order placed", {
      description: "Thank you for your purchase. This is a demo checkout.",
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

        <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
          {/* Left: form */}

          <div className="space-y-12">
            {/* Contact */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Contact Information</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Email" name="email" type="email" placeholder="you@example.com" />
                <Input label="Phone" name="phone" type="tel" placeholder="+20 ..." />
              </div>
            </div>

            {/* Shipping address */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Shipping Address</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="First Name" name="firstName" placeholder="First name" />
                <Input label="Last Name" name="lastName" placeholder="Last name" />
                <Input label="Country" name="country" placeholder="Egypt" className="sm:col-span-2" />
                <Input label="City" name="city" placeholder="Cairo" />
                <Input label="Postal Code" name="postal" placeholder="11511" />
                <Input label="Address" name="address" placeholder="Street, building, apartment" className="sm:col-span-2" />
              </div>
            </div>

            {/* Shipping method */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Shipping Method</h2>

              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setShippingMethod(method.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                      shippingMethod === method.id
                        ? "border-black"
                        : "border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-sm text-neutral-500">{method.detail}</p>
                    </div>

                    <span className="text-sm font-medium">
                      {method.price === 0 ? "Free" : `EGP ${method.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}

            <div>
              <h2 className="mb-6 text-xl font-semibold">Payment Method</h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
                      paymentMethod === method.id
                        ? "border-black"
                        : "border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === method.id
                          ? "border-black"
                          : "border-neutral-300"
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <span className="h-2.5 w-2.5 rounded-full bg-black" />
                      )}
                    </span>

                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Input label="Card Number" name="card" placeholder="0000 0000 0000 0000" className="sm:col-span-2" />
                  <Input label="Expiry" name="expiry" placeholder="MM / YY" />
                  <Input label="CVC" name="cvc" placeholder="123" />
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
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
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
                            onClick={() => decrease(item.productId)}
                            className="flex h-8 w-8 items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-8 text-center text-sm">{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => increase(item.productId)}
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
                      <Check size={16} className="text-black" />
                      {appliedCoupon.code} — {appliedCoupon.rate * 100}% off
                    </span>

                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs uppercase tracking-[0.18em] text-neutral-500 hover:text-black"
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

              <Button
                type="button"
                size="lg"
                className="mt-6 w-full"
                onClick={placeOrder}
              >
                Place Order
              </Button>

              <p className="mt-4 text-center text-xs text-neutral-400">
                This is a demo checkout. No payment is processed.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Container>
  );
}
