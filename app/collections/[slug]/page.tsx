import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";
import { ShopHeader } from "@/components/shop/shop-header";
import { CollectionProducts } from "@/components/collections/collection-products";
import { JsonLd } from "@/components/seo/json-ld";
import {
  collections,
  getCollectionBySlug,
  getCollectionProducts,
} from "@/constants/collections";
import { siteConfig } from "@/constants/site";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;

  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {};
  }

  return {
    title: collection.title,
    description: collection.description,
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
    openGraph: {
      title: `${collection.title} | ${siteConfig.name}`,
      description: collection.description,
      url: `${siteConfig.url}/collections/${collection.slug}`,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: collection.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | ${siteConfig.name}`,
      description: collection.description,
      images: [collection.coverImage],
    },
  };
}

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;

  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = getCollectionProducts(collection.productSlugs);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: `${siteConfig.url}/collections`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: `${siteConfig.url}/collections/${collection.slug}`,
      },
    ],
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/logos/tema-black.png`,
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, organizationJsonLd]} />
      <ShopHeader
        title={collection.title}
        description={collection.description}
      />

      <Container>
        <CollectionProducts products={products} />
      </Container>
    </>
  );
}
