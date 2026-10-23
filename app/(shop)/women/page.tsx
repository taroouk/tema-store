import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getProductsByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Women",
  description: "Discover premium oversized essentials designed for everyday luxury.",
  alternates: { canonical: "/women" },
};

export default async function WomenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProductsByCategory("women");

  return (
    <ShopCatalog
      title="Women"
      description="Discover premium oversized essentials designed for everyday luxury."
      basePath="/women"
      products={products}
      searchParams={searchParams}
    />
  );
}
