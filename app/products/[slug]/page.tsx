import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";

import { ProductGallery } from "@/components/product/details/product-gallery";
import { ProductInfo } from "@/components/product/details/product-info";
import { ProductAccordion } from "@/components/product/details/product-accordion";
import { RelatedProducts } from "@/components/product/details/related-products";
import { Reviews } from "@/components/product/reviews";
import { JsonLd } from "@/components/seo/json-ld";

import { allProducts } from "@/constants/all-products";
import { siteConfig } from "@/constants/site";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = allProducts.find((item) => item.slug === slug);

  if (!product) {
    return {};
  }

  const url = `${siteConfig.url}/products/${product.slug}`;
  const image = product.images[0]?.src
    ? `${siteConfig.url}${product.images[0].src}`
    : siteConfig.ogImage;

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description,
      images: [image],
    },
  };
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

  const url = `${siteConfig.url}/products/${product.slug}`;
  const image = product.images[0]?.src
    ? `${siteConfig.url}${product.images[0].src}`
    : siteConfig.ogImage;

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image,
    url,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EGP",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabel,
        item: `${siteConfig.url}/${product.category}`,
      },
      { "@type": "ListItem", position: 3, name: product.name, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <Container>
        <section className="grid gap-16 py-16 lg:grid-cols-2">
          <ProductGallery product={product} />

          <ProductInfo product={product} />
        </section>

        <ProductAccordion product={product} />

        <Reviews />
      </Container>

      <RelatedProducts />
    </>
  );
}