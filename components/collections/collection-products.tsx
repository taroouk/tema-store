"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";

import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/product-grid";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { ShopLayout } from "@/components/shop/shop-layout";

type SortKey = "featured" | "price-asc" | "price-desc";

interface CollectionProductsProps {
  products: Product[];
}

export function CollectionProducts({ products }: CollectionProductsProps) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(999);

  const filtered = useMemo(() => {
    const list = products.filter((product) => product.price <= maxPrice);

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      default:
        return list;
    }
  }, [products, sort, maxPrice]);

  return (
    <ShopLayout
      sidebar={
        <div className="space-y-10">
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">
              Price
            </h3>

            <input
              type="range"
              min={299}
              max={999}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full accent-black"
            />

            <p className="mt-3 text-sm text-neutral-500">
              Up to EGP {maxPrice}
            </p>
          </div>

          <FiltersSidebar />
        </div>
      }
    >
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-neutral-400" />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-10 rounded-full border border-neutral-300 bg-white px-4 text-sm focus:border-black focus:outline-none"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 px-8 py-24 text-center">
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No products found
          </h2>

          <p className="mt-4 max-w-md text-neutral-500">
            Try adjusting the filters to see more from this collection.
          </p>
        </div>
      )}
    </ShopLayout>
  );
}
