"use client";

import { priceForSize } from "@/lib/size-price";
import Link from "next/link";

import { shippingFee } from "@/lib/pricing";
import { useCartStore } from "@/stores/cart-store";
import { usePricing, useCatalog } from "@/components/catalog/catalog-provider";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const products = useCatalog();
  const pricing = usePricing();

  const subtotal = items.reduce((total, item) => {
    const product = products.find(
      (product) => product.id === item.productId
    );

    if (!product) return total;

    return total + priceForSize(product, item.size) * item.quantity;
  }, 0);

  const shipping = subtotal === 0 ? 0 : shippingFee(subtotal, "standard", pricing);

  const total = subtotal + shipping;

  return (
    <aside className="sticky top-28 h-fit rounded-3xl border border-neutral-200 p-8">
      <h2 className="text-2xl font-semibold">
        Order Summary
      </h2>

      <div className="mt-8 space-y-5">
        <div className="flex justify-between">
          <span className="text-neutral-500">
            Subtotal
          </span>

          <span>EGP {subtotal}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-500">
            Shipping
          </span>

          <span>
            {shipping === 0
              ? "Free"
              : `EGP ${shipping}`}
          </span>
        </div>

        <div className="border-t pt-5">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>

            <span>EGP {total}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-10 flex h-14 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-neutral-800"
      >
        Proceed To Checkout
      </Link>
    </aside>
  );
}