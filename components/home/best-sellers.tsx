import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-grid";
import { bestSellers } from "@/constants/best-sellers";

export function BestSellers() {
  return (
    <Section className="py-24">
      <Container>
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Customer Favorites
            </span>

            <h2
              className="text-4xl font-semibold tracking-tight md:text-5xl"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              Best Sellers
            </h2>

            <p className="mt-3 max-w-lg text-neutral-600">
              Our most loved essentials, chosen by the TEMA community.
            </p>
          </div>

          <Link
            href="/best-sellers"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:gap-3"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        <ProductGrid products={bestSellers} />
      </Container>
    </Section>
  );
}