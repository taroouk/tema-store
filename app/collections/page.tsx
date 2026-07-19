import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { CollectionCard } from "@/components/collections/collection-card";
import { collections } from "@/constants/collections";
import { siteConfig } from "@/constants/site";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Curated TEMA collections — from everyday essentials to limited releases. Timeless, premium fashion.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Collections | TEMA",
    description:
      "Curated TEMA collections — from everyday essentials to limited releases.",
    url: `${siteConfig.url}/collections`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | TEMA",
    description:
      "Curated TEMA collections — from everyday essentials to limited releases.",
    images: [siteConfig.ogImage],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  logo: `${siteConfig.url}/logos/tema-black.png`,
};

export default function CollectionsPage() {
  return (
    <Section className="py-16">
      <JsonLd data={organizationJsonLd} />
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
