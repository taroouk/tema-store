import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getProductsByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Accessories",
  description: "Complete your look with premium everyday essentials.",
  alternates: { canonical: "/accessories" },
};

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProductsByCategory("accessories");

  return (
    <ShopCatalog
      title="Accessories"
      description="Complete your look with premium everyday essentials."
      basePath="/accessories"
      products={products}
      searchParams={searchParams}
    />
  );
}
