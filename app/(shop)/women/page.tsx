import { women } from "@/constants/women";

import { ProductGrid } from "@/components/product/product-grid";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopLayout } from "@/components/shop/shop-layout";

export default function WomenPage() {
  return (
    <>
      <ShopHeader
        title="Women"
        description="Discover premium oversized essentials designed for everyday luxury."
      />

      <ShopLayout sidebar={<FiltersSidebar />}>
        <ProductGrid products={women} />
      </ShopLayout>
    </>
  );
}
