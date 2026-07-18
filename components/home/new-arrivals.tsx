import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { newArrivals } from "@/constants/products";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { ProductGrid } from "@/components/product/product-grid";
import { Features } from "@/components/home/features";

export function NewArrivals() {
  return (
    <Section className="pt-4 pb-20">
      <Container>
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Latest Collection
            </span>

            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              New Arrivals
            </h2>

            <p className="mt-3 max-w-lg text-neutral-600">
              Discover the latest pieces from TEMA. Designed with premium
              materials and timeless silhouettes.
            </p>
          </div>

          <Link
            href="/new-in"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:gap-3"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Products */}
        <ProductGrid products={newArrivals} />

        {/* Features */}
        <div className="mt-16">
          <Features />
        </div>
      </Container>
    </Section>
  );
}