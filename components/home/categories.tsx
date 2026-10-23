import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

import { CategoryBanner } from "./category-banner";

export function Categories() {
  return (
    <Section className="pt-8 pb-6">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CategoryBanner
            title="Men"
            href="/men"
            image="/images/categories/men.jpg"
            className="md:col-span-2 md:aspect-[21/9] lg:col-span-1 lg:aspect-[4/5]"
          />

          <CategoryBanner
            title="Women"
            href="/women"
            image="/images/categories/women.jpg"
            className="lg:aspect-[4/5]"
          />

          <CategoryBanner
            title="Accessories"
            href="/accessories"
            image="/images/categories/accessories.jpg"
            className="lg:aspect-[4/5]"
          />
        </div>
      </Container>
    </Section>
  );
}