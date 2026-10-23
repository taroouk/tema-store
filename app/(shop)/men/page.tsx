import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getProductsByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Men",
  description: "Discover premium oversized essentials designed for everyday luxury.",
  alternates: { canonical: "/men" },
};

export default async function MenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProductsByCategory("men");

  return (
    <ShopCatalog
      title="Men"
      description="Discover premium oversized essentials designed for everyday luxury."
      basePath="/men"
      products={products}
      searchParams={searchParams}
    />
  );
}
