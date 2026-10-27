import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getProductsByCategory } from "@/lib/catalog";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Any category added in Admin → Categories gets its own page here (men / women / accessories keep their own files).
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { category } = await params;
  const products = await getProductsByCategory(category);
  if (products.length === 0) return { title: "Not found", robots: { index: false } };
  const name = products[0].categoryName ?? category;
  return {
    title: name,
    description: `Shop ${name} at Tema Label.`,
    alternates: { canonical: `/${category}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const products = await getProductsByCategory(category);
  if (products.length === 0) notFound();
  const name = products[0].categoryName ?? category;

  return (
    <ShopCatalog
      title={name}
      description={`Shop ${name} at Tema Label.`}
      basePath={`/${category}`}
      products={products}
      searchParams={searchParams}
    />
  );
}
