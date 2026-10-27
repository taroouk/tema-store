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

  const cols =
    categories.length === 1 ? "" : categories.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <Section className="pt-8 pb-6">
      <Container>
        <div className={`grid grid-cols-1 gap-6 ${cols}`}>
          {categories.map((c, i) => {
            const image =
              PHOTOS[c.slug] ?? products.find((p) => p.category === c.slug)?.images[0]?.src ?? "/images/hero-1.png";
            // With exactly three banners the first spans two columns on tablets, as before.
            const wideFirst = categories.length === 3 && i === 0;
            return (
              <CategoryBanner
                key={c.slug}
                title={c.name}
                href={`/${c.slug}`}
                image={image}
                className={
                  categories.length === 1
                    ? "aspect-[21/9]"
                    : wideFirst
                      ? "md:col-span-2 md:aspect-[21/9] lg:col-span-1 lg:aspect-[4/5]"
                      : "lg:aspect-[4/5]"
                }
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
