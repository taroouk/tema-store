import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

import { CategoryBanner } from "./category-banner";

export function Categories() {
  return (
    <Section className="pt-8 pb-6">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CategoryBanner
            title="Men"
            href="/men"
            image="/images/categories/men.jpg"
          />

          <CategoryBanner
            title="Women"
            href="/women"
            image="/images/categories/womeen.jpg"
          />

          <CategoryBanner
            title="Accessories"
            href="/accessories"
            image="/images/categories/accessories.jpg"
          />
        </div>
      </Container>
    </Section>
  );
}