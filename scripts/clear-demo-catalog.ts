/**
 * Removes the demo catalog that `npm run db:seed` created, so you can start with your real products:
 * the 16 demo products are ARCHIVED (kept in the database, hidden from the store, still referenced by any
 * past orders).
 *
 *   npm run db:clear-demo            # dry run: shows what would change
 *   npm run db:clear-demo -- --yes   # actually do it
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { allProducts } from "../constants/all-products";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes("--yes");

async function main() {
  const slugs = allProducts.map((p) => p.slug);
  const products = await prisma.product.findMany({ where: { slug: { in: slugs }, deletedAt: null }, select: { name: true } });

  console.log(`${products.length} demo products to archive:`, products.map((p) => p.name).join(", ") || "-");
  if (!apply) return console.log("\nDry run. Re-run with  -- --yes  to apply.");

  await prisma.product.updateMany({ where: { slug: { in: slugs }, deletedAt: null }, data: { status: "ARCHIVED", deletedAt: new Date() } });
  console.log("\nDone. Remember: the storefront refreshes within 5 minutes (or right after any admin edit).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
