"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { slugify, withMessage } from "@/lib/admin/format";
import { CATALOG_TAG } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

const money = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().min(0).max(10_000_000).optional()
);

const ProductInput = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional(),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(1).max(5000),
  material: z.string().trim().max(500).optional(),
  careInstructions: z.string().trim().max(1000).optional(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(170).optional(),
  price: z.coerce.number().min(0).max(10_000_000),
  compareAtPrice: money,
  costPrice: money,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  badge: z.enum(["NEW", "BEST_SELLER", "LIMITED", "SOLD_OUT"]).optional().or(z.literal("")),
  featured: z.boolean(),
});

function parseForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };

  const input = ProductInput.safeParse({
    name: get("name"),
    slug: get("slug"),
    categoryId: get("categoryId"),
    description: get("description"),
    material: get("material") || undefined,
    careInstructions: get("careInstructions") || undefined,
    metaTitle: get("metaTitle") || undefined,
    metaDescription: get("metaDescription") || undefined,
    price: get("price"),
    compareAtPrice: get("compareAtPrice"),
    costPrice: get("costPrice"),
    status: get("status"),
    badge: get("badge") ?? "",
    featured: formData.get("featured") === "on",
  });
  if (!input.success) return { error: input.error.issues[0].message + ` (${input.error.issues[0].path.join(".")})` };

  const images = (get("images") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, alt] = line.split("|").map((s) => s.trim());
      return { url, alt: alt ?? "" };
    });
  if (images.some((i) => !/^(https?:\/\/|\/)/.test(i.url))) {
    return { error: "Each image must be a URL or a /path, one per line" };
  }

  const colors = (get("colors") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)\s*(#[0-9a-fA-F]{3,8})$/);
      return m ? { name: m[1].trim(), hex: m[2] } : null;
    });
  if (colors.length === 0 || colors.includes(null)) {
    return { error: "Colors: one per line as  Name #hex  (e.g. Black #000000)" };
  }

  const sizes = [
    ...new Set(
      (get("sizes") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
  if (sizes.length === 0) return { error: "Add at least one size" };

  const data = input.data;
  return {
    data: {
      ...data,
      slug: slugify(data.slug || data.name),
      badge: data.badge || null,
      // Empty fields must clear the stored value, not be skipped.
      material: data.material ?? null,
      careInstructions: data.careInstructions ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    },
    images,
    colors: colors as { name: string; hex: string }[],
    sizes,
    initialStock: Math.max(0, Number(get("initialStock") ?? 0) || 0),
  };
}

const skuFor = (slug: string, color: string, size: string) =>
  `${slug}-${color}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");

function dbError(e: unknown, back: string): never {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    redirect(withMessage(back, "error", "Slug or SKU already exists. Choose a different slug."));
  }
  throw e;
}

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const parsed = parseForm(formData);
  if ("error" in parsed) redirect(withMessage("/admin/products/new", "error", parsed.error!));

  const { data, images, colors, sizes, initialStock } = parsed;
  let id: string;
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        publishedAt: data.status === "ACTIVE" ? new Date() : null,
        images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
        variants: {
          create: colors.flatMap((c, ci) =>
            sizes.map((s, si) => ({
              sku: skuFor(data.slug, c.name, s),
              colorName: c.name,
              colorHex: c.hex,
              size: s,
              stock: initialStock,
              position: ci * sizes.length + si,
            }))
          ),
        },
      },
    });
    id = product.id;
    await audit(admin, {
      action: "create",
      entity: "Product",
      entityId: id,
      summary: `Created product "${data.name}"`,
    });
  } catch (e) {
    dbError(e, "/admin/products/new");
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  redirect(withMessage(`/admin/products/${id}`, "ok", "Product created"));
}

export async function updateProduct(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const back = `/admin/products/${id}`;
  const parsed = parseForm(formData);
  if ("error" in parsed) redirect(withMessage(back, "error", parsed.error!));

  const { data, images, colors, sizes } = parsed;
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUniqueOrThrow({
        where: { id },
        include: { variants: true },
      });

      await tx.product.update({
        where: { id },
        data: {
          ...data,
          publishedAt:
            data.status === "ACTIVE" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: images.map((img, i) => ({ ...img, sortOrder: i, productId: id })),
      });

      // Sync variants with colors × sizes: keep existing stock, add new combos, drop removed.
      const wanted = colors.flatMap((c) => sizes.map((s) => ({ c, s })));
      const key = (color: string, size: string) => `${color}__${size}`;
      const wantedKeys = new Set(wanted.map(({ c, s }) => key(c.name, s)));
      const have = new Map(existing.variants.map((v) => [key(v.colorName, v.size), v]));

      const removed = existing.variants.filter((v) => !wantedKeys.has(key(v.colorName, v.size)));
      if (removed.length) {
        await tx.productVariant.deleteMany({ where: { id: { in: removed.map((v) => v.id) } } });
      }
      for (const [i, { c, s }] of wanted.entries()) {
        const current = have.get(key(c.name, s));
        if (current) {
          await tx.productVariant.update({
            where: { id: current.id },
            data: { colorHex: c.hex, position: i },
          });
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: skuFor(data.slug, c.name, s),
              colorName: c.name,
              colorHex: c.hex,
              size: s,
              position: i,
            },
          });
        }
      }
    });
    await audit(admin, {
      action: "update",
      entity: "Product",
      entityId: id,
      summary: `Updated product "${data.name}"`,
    });
  } catch (e) {
    dbError(e, back);
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  redirect(withMessage(back, "ok", "Product saved"));
}

export async function updateStock(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const back = `/admin/products/${id}`;

  const updates: { variantId: string; stock: number }[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("stock_")) continue;
    const stock = Number(v);
    if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
      redirect(withMessage(back, "error", "Stock must be a whole number ≥ 0"));
    }
    updates.push({ variantId: k.slice(6), stock });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.productVariant.updateMany({
        where: { id: u.variantId, productId: id },
        data: { stock: u.stock },
      })
    )
  );
  await audit(admin, {
    action: "stock",
    entity: "Product",
    entityId: id,
    summary: `Updated stock for ${updates.length} variants`,
  });

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/inventory");
  redirect(withMessage(back, "ok", "Stock updated"));
}

export async function archiveProduct(id: string) {
  const admin = await requireAdmin("catalog:write");
  const product = await prisma.product.update({
    where: { id },
    data: { status: "ARCHIVED", deletedAt: new Date() },
  });
  await audit(admin, {
    action: "delete",
    entity: "Product",
    entityId: id,
    summary: `Archived product "${product.name}"`,
  });
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/products");
  redirect(withMessage("/admin/products", "ok", `"${product.name}" archived`));
}
