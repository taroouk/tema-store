import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShopCatalog } from "@/components/shop/shop-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCollectionBySlug,
  getCollectionProducts,
  getCollections,
} from "@/lib/catalog";
import { siteConfig } from "@/constants/site";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;

  const collection = await getCollectionBySlug(slug);

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
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;

  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = await getCollectionProducts(collection.productSlugs);

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
      <ShopCatalog
        title={collection.title}
        description={collection.description}
        basePath={`/collections/${collection.slug}`}
        products={products}
        searchParams={searchParams}
      />
    </>
  );
}
