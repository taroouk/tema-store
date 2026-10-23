import type { Metadata } from "next";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getProductsByBadge } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "New In",
  description: "The latest drops from Tema Label. Fresh arrivals, timeless design.",
  alternates: { canonical: "/new-in" },
};

export default async function NewInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProductsByBadge("NEW");

  return (
    <ShopCatalog
      title="New In"
      description="The latest drops from Tema Label. Fresh arrivals, timeless design."
      basePath="/new-in"
      products={products}
      searchParams={searchParams}
    />
  );
}
