import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";

import { ProductGallery } from "@/components/product/details/product-gallery";
import { ProductInfo } from "@/components/product/details/product-info";
import { ProductAccordion } from "@/components/product/details/product-accordion";
import { RelatedProducts } from "@/components/product/details/related-products";
import { JsonLd } from "@/components/seo/json-ld";

import { getProductBySlug } from "@/lib/catalog";
import { siteConfig } from "@/constants/site";

const absolute = (src: string) => (/^https?:\/\//.test(src) ? src : `${siteConfig.url}${src}`);

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  const url = `${siteConfig.url}/products/${product.slug}`;
  const image = product.images[0]?.src ? absolute(product.images[0].src) : absolute(siteConfig.ogImage);

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || `${product.description} Shop ${product.name} at ${siteConfig.name}.`,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.metaTitle || product.name} | ${siteConfig.name}`,
      description: product.metaDescription || product.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.metaTitle || product.name} | ${siteConfig.name}`,
      description: product.metaDescription || product.description,
      images: [image],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const url = `${siteConfig.url}/products/${product.slug}`;
  const image = product.images[0]?.src ? absolute(product.images[0].src) : absolute(siteConfig.ogImage);

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.length ? product.images.map((i) => absolute(i.src)) : [image],
    ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
    ...(product.material ? { material: product.material.split("\n")[0] } : {}),
    url,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "EGP",
      priceValidUntil: validUntil.toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: siteConfig.name },
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

      </Container>

      <RelatedProducts product={product} />
    </>
  );
}