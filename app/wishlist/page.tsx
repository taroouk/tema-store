"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Container } from "@/components/common/container";
import { ProductCard } from "@/components/product/product-card";
import { allProducts } from "@/constants/all-products";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const remove = useWishlistStore((state) => state.remove);
  const clear = useWishlistStore((state) => state.clear);

  const products = allProducts.filter((product) =>
    items.includes(product.id)
  );

  return (
    <Container>
      <section className="py-16">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Saved Items
            </span>

            <h1
              className="text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wishlist
            </h1>
          </div>

          {products.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-red-500"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
            <h2
              className="text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your wishlist is empty.
            </h2>

            <p className="mt-5 max-w-md leading-8 text-neutral-500">
              Tap the heart on any product to save it here for later.
            </p>

            <Link
              href="/men"
              className="mt-10 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative">
                <ProductCard product={product} />

                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
