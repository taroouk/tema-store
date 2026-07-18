import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";

import { ProductGallery } from "@/components/product/details/product-gallery";
import { ProductInfo } from "@/components/product/details/product-info";
import { ProductAccordion } from "@/components/product/details/product-accordion";
import { RelatedProducts } from "@/components/product/details/related-products";

import { allProducts } from "@/constants/all-products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = allProducts.find(
    (item) => item.slug === slug
  );

  if (!product) {
    notFound();
  }

  return (
    <>
      <Container>
        <section className="grid gap-16 py-16 lg:grid-cols-2">
          <ProductGallery product={product} />

          <ProductInfo product={product} />
        </section>

        <ProductAccordion product={product} />
      </Container>

      <RelatedProducts />
    </>
  );
}