import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/common/container";

import { newArrivals } from "@/constants/products";

export function RelatedProducts() {
  return (
    <section className="border-t border-neutral-200 py-24">
      <Container>
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              You May Also Like
            </span>

            <h2
              className="text-4xl font-semibold md:text-5xl"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              Related Products
            </h2>
          </div>

          <Link
            href="/new-in"
            className="hidden items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:gap-3 md:inline-flex"
          >
            View All

            <ArrowRight size={16} />
          </Link>
        </div>

        <ProductGrid products={newArrivals.slice(0, 4)} />
      </Container>
    </section>
  );
}