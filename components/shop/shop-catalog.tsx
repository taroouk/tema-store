import { Suspense } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { ActiveFilters } from "@/components/shop/active-filters";
import { EmptyState } from "@/components/shop/empty-state";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopLayout } from "@/components/shop/shop-layout";
import { ShopPagination } from "@/components/shop/pagination";
import { SortDropdown } from "@/components/shop/sort-dropdown";
import { applyShopQuery, buildFacets, hasActiveFilters, parseShopQuery } from "@/lib/catalog/filter";
import type { Product } from "@/types/product";

type RawParams = Record<string, string | string[] | undefined>;

/** One listing page: header, filters, sort, grid, pagination. Driven entirely by the URL. */
export async function ShopCatalog({
  title,
  description,
  basePath,
  products,
  searchParams,
}: {
  title: string;
  description: string;
  basePath: string;
  products: Product[];
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const query = parseShopQuery(raw);
  const facets = buildFacets(products);
  const result = applyShopQuery(products, query);

  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value && k !== "page") urlParams.set(k, value);
  }

  const sidebar = (
    <Suspense>
      <FiltersSidebar facets={facets} />
    </Suspense>
  );

  return (
    <>
      <ShopHeader title={title} description={description} />
      <ShopLayout sidebar={<div className="sticky top-28">{sidebar}</div>}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500" aria-live="polite">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-3">
            <MobileFilters>{sidebar}</MobileFilters>
            <Suspense>
              <SortDropdown />
            </Suspense>
          </div>
        </div>
        <ActiveFilters basePath={basePath} query={query} />
        {result.items.length ? (
          <>
            <ProductGrid products={result.items} />
            <ShopPagination basePath={basePath} page={result.page} pages={result.pages} params={urlParams} />
          </>
        ) : (
          <EmptyState filtered={hasActiveFilters(query)} basePath={basePath} />
        )}
      </ShopLayout>
    </>
  );
}
