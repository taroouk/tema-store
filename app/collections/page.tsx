import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { CollectionCard } from "@/components/collections/collection-card";
import { collections } from "@/constants/collections";

export default function CollectionsPage() {
  return (
    <Section className="py-16">
      <Container>
        <div className="mb-12">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Shop
          </span>

          <h1
            className="text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Collections
          </h1>

          <p className="mt-4 max-w-2xl leading-8 text-neutral-600">
            Curated edits built around how you actually dress — from everyday
            essentials to limited releases.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
