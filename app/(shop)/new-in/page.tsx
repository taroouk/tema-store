import { allProducts } from "@/constants/all-products";

import { ProductGrid } from "@/components/product/product-grid";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopLayout } from "@/components/shop/shop-layout";

const newIn = allProducts.filter((product) => product.badge === "NEW");

export default function NewInPage() {
  return (
    <>
      <ShopHeader
        title="New In"
        description="The latest drops from TEMA. Fresh arrivals, timeless design."
      />

      <ShopLayout sidebar={<FiltersSidebar />}>
        <ProductGrid products={newIn} />
      </ShopLayout>
    </>
  );
}
