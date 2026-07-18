import { accessories } from "@/constants/accessories";

import { ProductGrid } from "@/components/product/product-grid";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopLayout } from "@/components/shop/shop-layout";

export default function AccessoriesPage() {
  return (
    <>
      <ShopHeader
        title="Accessories"
        description="Complete your look with premium everyday essentials."
      />

      <ShopLayout sidebar={<FiltersSidebar />}>
        <ProductGrid products={accessories} />
      </ShopLayout>
    </>
  );
}
