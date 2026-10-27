"use client";

import { useCatalog, useCategories } from "@/components/catalog/catalog-provider";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

import { CategoryBanner } from "./category-banner";

const PHOTOS: Record<string, string> = {
  men: "/images/categories/men.jpg",
  women: "/images/categories/women.jpg",
  accessories: "/images/categories/accessories.jpg",
};

/** One banner per category that exists in Admin → Categories. */
export function Categories() {
  const categories = useCategories();
  const products = useCatalog();

  if (categories.length === 0) return null;

  // Few categories stay compact and centered instead of stretching across the page.
  const layout =
    categories.length === 1
      ? "mx-auto max-w-xl"
      : categories.length === 2
        ? "mx-auto max-w-4xl md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <Section className="pt-8 pb-6">
      <Container>
        <div className={`grid grid-cols-1 gap-5 ${layout}`}>
          {categories.map((c) => {
            const image =
              PHOTOS[c.slug] ?? products.find((p) => p.category === c.slug)?.images[0]?.src ?? "/images/hero-1.png";
            return <CategoryBanner key={c.slug} title={c.name} href={`/${c.slug}`} image={image} />;
          })}
        </div>
      </Container>
    </Section>
  );
}
