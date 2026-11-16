/**
 * One-off: shrinks images already uploaded to Supabase Storage (ProductImage.url, Category.image).
 * Each is resized (max 1600px) and re-encoded as WebP into a NEW file; the DB link is switched to it.
 * Old files are kept (a mapping is written to scripts/compress-existing-images.map.json) so nothing is lost.
 *
 *   tsx scripts/compress-existing-images.ts         # dry run
 *   tsx scripts/compress-existing-images.ts --yes   # apply
 */
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const apply = process.argv.includes("--yes");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
const MARK = "/storage/v1/object/public/products/";
const done = new Map<string, string>();
const map: Record<string, string> = {};
let before = 0;
let after = 0;

async function shrink(url: string): Promise<string | null> {
  if (!url.includes(MARK)) return null;
  if (done.has(url)) return done.get(url)!;
  const res = await fetch(url);
  if (!res.ok) return console.log("  skip (download failed)", url), null;
  const input = Buffer.from(await res.arrayBuffer());
  const out = await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  if (out.length >= input.length * 0.9) return console.log(`  keep ${(input.length / 1024) | 0}KB (already small)`), null;
  console.log(`  ${(input.length / 1024) | 0}KB -> ${(out.length / 1024) | 0}KB  ${url.split("/").pop()}`);
  before += input.length;
  after += out.length;
  if (!apply) return null;
  const path = `${new Date().getFullYear()}/${randomUUID()}.webp`;
  const { error } = await supabase.storage.from("products").upload(path, out, { contentType: "image/webp" });
  if (error) return console.log("  upload failed", error.message), null;
  const next = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
  done.set(url, next);
  map[url] = next;
  return next;
}

async function main() {
  for (const img of await prisma.productImage.findMany()) {
    const next = await shrink(img.url);
    if (next) await prisma.productImage.update({ where: { id: img.id }, data: { url: next } });
  }
  for (const c of await prisma.category.findMany({ where: { image: { not: null } } })) {
    const next = await shrink(c.image!);
    if (next) await prisma.category.update({ where: { id: c.id }, data: { image: next } });
  }
  console.log(`\nTotal ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
  if (apply) writeFileSync("scripts/compress-existing-images.map.json", JSON.stringify(map, null, 2));
  else console.log("Dry run. Re-run with --yes to apply.");
}

main().finally(() => prisma.$disconnect());
