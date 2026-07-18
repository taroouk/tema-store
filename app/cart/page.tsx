"use client";

import { Container } from "@/components/common/container";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";

import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  const clear = useCartStore((state) => state.clear);

  return (
    <Container>
      <section className="py-16">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Shopping Cart
          </span>

          <h1
            className="mt-4 text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
            }}
          >
            Your Cart
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
            <div className="space-y-8">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-red-500"
                >
                  Clear Cart
                </button>
              </div>

              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.size}-${item.colorId}`}
                  item={item}
                />
              ))}
            </div>

            <CartSummary />
          </div>
        )}
      </section>
    </Container>
  );
}