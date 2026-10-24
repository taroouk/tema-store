import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  headingLevel?: "h2" | "h3";
  /** How many cards at the start of the grid are above the fold. */
  eagerCount?: number;
}

export function ProductGrid({
  products,
  headingLevel,
  eagerCount = 0,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          headingLevel={headingLevel}
          eager={index < eagerCount}
        />
      ))}
    </div>
  );
}