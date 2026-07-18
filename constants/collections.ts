import type { Product } from "@/types/product";
import { allProducts } from "@/constants/all-products";

export interface Collection {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  productSlugs: string[];
}

export const collections: Collection[] = [
  {
    slug: "everyday",
    title: "Everyday Collection",
    description:
      "Quiet, considered essentials designed to be worn on repeat. Premium cotton, timeless silhouettes.",
    coverImage: "/images/products/product-1.png",
    productSlugs: [
      "essential-oversized-tee",
      "minimal-logo-tee",
      "relaxed-fit-tee",
      "women-essential-tee",
      "women-relaxed-tee",
    ],
  },
  {
    slug: "essentials",
    title: "Essentials Collection",
    description:
      "The building blocks of a refined wardrobe. Structured fits and signature TEMA detailing.",
    coverImage: "/images/products/product-5.png",
    productSlugs: [
      "et-back-print-tee",
      "heavyweight-oversized-tee",
      "classic-logo-tee",
      "essential-back-print",
      "women-classic-tee",
    ],
  },
  {
    slug: "summer",
    title: "Summer Collection",
    description:
      "Lightweight layers and warm-weather staples. Made to move with the season.",
    coverImage: "/images/products/product-8.png",
    productSlugs: [
      "minimal-relaxed-fit",
      "women-oversized-tee",
      "signature-cap",
      "canvas-tote",
    ],
  },
  {
    slug: "limited",
    title: "Limited Collection",
    description:
      "Small-batch releases in exclusive colorways. Once they are gone, they are gone.",
    coverImage: "/images/products/product-3.png",
    productSlugs: [
      "essential-oversized-tee",
      "et-back-print-tee",
      "essential-back-print",
      "knit-beanie",
      "leather-belt",
    ],
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

export function getCollectionProducts(slugs: string[]): Product[] {
  const lookup = new Map(allProducts.map((product) => [product.slug, product]));

  return slugs
    .map((slug) => lookup.get(slug))
    .filter((product): product is Product => Boolean(product));
}
