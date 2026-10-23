import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductBadge } from "@prisma/client";

import { allProducts } from "../constants/all-products";
import { collections } from "../constants/collections";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const BADGES: Record<string, ProductBadge> = {
  NEW: "NEW",
  "BEST SELLER": "BEST_SELLER",
  LIMITED: "LIMITED",
  "SOLD OUT": "SOLD_OUT",
};

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function main() {
  const categories = new Map<string, string>();
  for (const slug of ["men", "women", "accessories"]) {
    const c = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: titleCase(slug) },
    });
    categories.set(slug, c.id);
  }

  for (const p of allProducts) {
    const combos = p.colors.flatMap((c) => p.sizes.map((s) => ({ c, s })));
    const base = Math.floor(p.stock / combos.length);
    const extra = p.stock - base * combos.length;

    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      featured: Boolean(p.featured),
      badge: p.badge ? BADGES[p.badge] : null,
      status: "ACTIVE" as const,
      publishedAt: new Date(),
      categoryId: categories.get(p.category)!,
    };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        ...data,
        images: {
          create: p.images.map((img, i) => ({
            url: img.src,
            alt: img.alt,
            sortOrder: i,
          })),
        },
        variants: {
          create: combos.map(({ c, s }, i) => ({
            sku: `${p.slug}-${c.id}-${s}`.toUpperCase(),
            colorName: c.name,
            colorHex: c.value,
            size: s,
            position: i,
            stock: base + (i < extra ? 1 : 0),
          })),
        },
      },
    });
    console.log("product", product.slug);
  }

  for (const [i, col] of collections.entries()) {
    const collection = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: {
        slug: col.slug,
        title: col.title,
        description: col.description,
        coverImage: col.coverImage,
        position: i,
      },
    });
    for (const [pos, slug] of col.productSlugs.entries()) {
      const product = await prisma.product.findUnique({ where: { slug } });
      if (!product) continue;
      await prisma.productCollection.upsert({
        where: {
          productId_collectionId: {
            productId: product.id,
            collectionId: collection.id,
          },
        },
        update: {},
        create: { productId: product.id, collectionId: collection.id, position: pos },
      });
    }
    console.log("collection", col.slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
