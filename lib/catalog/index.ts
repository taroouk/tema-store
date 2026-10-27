import "server-only";

import { sortSizes } from "@/lib/size-price";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma/client";
import type { Product, ProductBadge } from "@/types/product";

export const CATALOG_TAG = "catalog";
const REVALIDATE_SECONDS = 300;

export interface Collection {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  productSlugs: string[];
}

const BADGES: Record<string, ProductBadge> = {
  NEW: "NEW",
  BEST_SELLER: "BEST SELLER",
  LIMITED: "LIMITED",
  SOLD_OUT: "SOLD OUT",
};

const colorId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** DB row -> the plain, JSON-safe shape the storefront components use. */
function toProduct(row: ProductRow): Product {
  const colors = new Map<string, { id: string; name: string; value: string }>();
  const sizes = new Set<string>();
  let stock = 0;

  for (const v of row.variants) {
    if (!colors.has(v.colorName)) {
      colors.set(v.colorName, { id: colorId(v.colorName), name: v.colorName, value: v.colorHex });
    }
    sizes.add(v.size);
    stock += Math.max(0, v.stock - v.reserved);
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    priceLarge: row.priceLarge ? Number(row.priceLarge) : undefined,
    compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : undefined,
    category: row.category.slug,
    categoryName: row.category.name,
    images: row.images.map((img) => ({ id: img.id, src: img.url, alt: img.alt || row.name })),
    colors: [...colors.values()],
    sizes: sortSizes([...sizes]),
    stock,
    variants: row.variants.map((v) => ({
      colorId: colorId(v.colorName),
      size: v.size,
      stock: Math.max(0, v.stock - v.reserved),
    })),
    material: row.material ?? undefined,
    careInstructions: row.careInstructions ?? undefined,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    sku: row.variants[0]?.sku,
    updatedAt: row.updatedAt.toISOString(),
    featured: row.featured,
    badge: stock === 0 ? "SOLD OUT" : row.badge ? BADGES[row.badge] : undefined,
  };
}

const visible = { status: "ACTIVE", deletedAt: null } as const;

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await prisma.product.findMany({
      where: visible,
      include: productInclude,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toProduct);
  },
  ["catalog-products"],
  { tags: [CATALOG_TAG], revalidate: REVALIDATE_SECONDS }
);

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: string) {
  return (await getProducts()).filter((p) => p.category === category);
}

export async function getProductsByBadge(badge: ProductBadge, limit?: number) {
  const list = (await getProducts()).filter((p) => p.badge === badge);
  return limit ? list.slice(0, limit) : list;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const all = (await getProducts()).filter((p) => p.id !== product.id);
  const same = all.filter((p) => p.category === product.category);
  return [...same, ...all.filter((p) => p.category !== product.category)].slice(0, limit);
}

export const getCollections = unstable_cache(
  async (): Promise<Collection[]> => {
    const rows = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      include: {
        productCollections: {
          orderBy: { position: "asc" },
          where: { product: visible },
          include: { product: { select: { slug: true } } },
        },
      },
    });
    return rows.map((c) => ({
      slug: c.slug,
      title: c.title,
      description: c.description,
      coverImage: c.coverImage ?? "/images/hero-1.png",
      productSlugs: c.productCollections.map((pc) => pc.product.slug),
    }));
  },
  ["catalog-collections"],
  { tags: [CATALOG_TAG], revalidate: REVALIDATE_SECONDS }
);

export async function getCollectionBySlug(slug: string) {
  return (await getCollections()).find((c) => c.slug === slug);
}

export async function getCollectionProducts(slugs: string[]) {
  const lookup = new Map((await getProducts()).map((p) => [p.slug, p]));
  return slugs.map((s) => lookup.get(s)).filter((p): p is Product => Boolean(p));
}
