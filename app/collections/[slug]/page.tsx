import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";
import { ShopHeader } from "@/components/shop/shop-header";
import { CollectionProducts } from "@/components/collections/collection-products";
import {
  collections,
  getCollectionBySlug,
  getCollectionProducts,
} from "@/constants/collections";

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

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;

  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = getCollectionProducts(collection.productSlugs);

  return (
    <>
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
