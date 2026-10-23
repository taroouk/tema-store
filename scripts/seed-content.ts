/**
 * Writes the built-in policy pages and FAQ into the database (only what is missing, so edits made in
 * the admin are never overwritten).   npm run db:seed:content
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { DEFAULT_FAQ, DEFAULT_PAGES } from "../lib/content/defaults";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  for (const p of DEFAULT_PAGES) {
    await prisma.contentPage.upsert({ where: { slug: p.slug }, update: {}, create: p });
    console.log("page", p.slug);
  }
  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({ data: DEFAULT_FAQ.map((f, i) => ({ ...f, position: i })) });
    console.log("faq", DEFAULT_FAQ.length);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
