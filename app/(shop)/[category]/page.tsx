import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { getCategories, getProductsByCategory } from "@/lib/catalog";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Any category added in Admin → Categories gets its own page here (men / women / accessories keep their own files).
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { category } = await params;
  const found = (await getCategories()).find((c) => c.slug === category);
  if (!found) return { title: "Not found", robots: { index: false } };
  const name = found.name;
  return {
    title: name,
    description: `Shop ${name} at Tema Label.`,
    alternates: { canonical: `/${category}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const found = (await getCategories()).find((c) => c.slug === category);
  if (!found) notFound();
  const products = await getProductsByCategory(category);
  const name = found.name;

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
