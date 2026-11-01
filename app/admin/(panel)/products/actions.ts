"use server";

import { sortSizes } from "@/lib/size-price";
import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { slugify, withMessage } from "@/lib/admin/format";
import { CATALOG_TAG } from "@/lib/catalog";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

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
  priceLarge: money,
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
    priceLarge: get("priceLarge"),
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

  const intent = get("intent");
  const data = input.data;
  if (intent === "draft") data.status = "DRAFT";
  if (intent === "publish") data.status = "ACTIVE";
  if (data.status === "ACTIVE" && images.length === 0) {
    return { error: "Add at least one image before publishing (or save it as a draft)." };
  }
  return {
    data: {
      ...data,
      slug: slugify(data.slug || data.name),
      badge: data.badge || null,
      priceLarge: data.priceLarge ?? null,
      // Empty fields must clear the stored value, not be skipped.
      material: data.material ?? null,
      careInstructions: data.careInstructions ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
    },
    images,
    colors: colors as { name: string; hex: string }[],
    sizes: sortSizes(sizes),
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

/** Removes one color/size combination. Past orders keep their own copy of the line item. */
export async function deleteVariant(productId: string, variantId: string) {
  const admin = await requireAdmin("catalog:write");
  const back = `/admin/products/${productId}`;

  const variants = await prisma.productVariant.findMany({ where: { productId }, select: { id: true, colorName: true, size: true } });
  const target = variants.find((v) => v.id === variantId);
  if (!target) redirect(withMessage(back, "error", "That size no longer exists"));
  if (variants.length === 1) {
    redirect(withMessage(back, "error", "A product needs at least one size. Archive the product instead."));
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
  await audit(admin, {
    action: "delete",
    entity: "Product",
    entityId: productId,
    summary: `Removed ${target.colorName} / ${target.size}`,
  });

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/inventory");
  redirect(withMessage(back, "ok", `Removed ${target.colorName} / ${target.size}`));
}

// ───────────────────────── Archive / restore / duplicate / delete ─────────────────────────

const LIST = "/admin/products";

function done(back: string, msg: string): never {
  updateTag(CATALOG_TAG);
  revalidatePath(LIST);
  redirect(withMessage(back, "ok", msg));
}

/** Only ever send people back to the products area (the value comes from a form field). */
function safeBack(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.startsWith("/admin/products") || raw.startsWith("//")) return LIST;
  try {
    const u = new URL(raw, "http://local");
    u.searchParams.delete("ok");
    u.searchParams.delete("error");
    return u.pathname + u.search;
  } catch {
    return LIST;
  }
}

const IdList = z.array(z.string().uuid()).min(1, "Select at least one product").max(200);

function selectedIds(formData: FormData, back: string) {
  const r = IdList.safeParse(formData.getAll("ids"));
  if (!r.success) redirect(withMessage(back, "error", r.error.issues[0].message));
  return r.data;
}

export async function archiveProduct(id: string) {
  const admin = await requireAdmin("catalog:write");
  const product = await prisma.product.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });
  await audit(admin, { action: "archive", entity: "Product", entityId: id, summary: `Archived product "${product.name}"` });
  done(LIST, `"${product.name}" archived — it is hidden from the store and can be restored any time`);
}

export async function restoreProduct(id: string) {
  const admin = await requireAdmin("catalog:write");
  const product = await prisma.product.update({ where: { id }, data: { status: "DRAFT", deletedAt: null } });
  await audit(admin, { action: "restore", entity: "Product", entityId: id, summary: `Restored product "${product.name}" as a draft` });
  done(`${LIST}/${id}`, `"${product.name}" restored as a draft — review it, then publish`);
}

export async function duplicateProduct(id: string) {
  const admin = await requireAdmin("catalog:write");
  const src = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { position: "asc" } } },
  });

  let slug = `${src.slug}-copy`;
  for (let n = 2; await prisma.product.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${src.slug}-copy-${n}`;

  const copy = await prisma.product.create({
    data: {
      name: `${src.name} (copy)`,
      slug,
      description: src.description,
      material: src.material,
      careInstructions: src.careInstructions,
      metaTitle: src.metaTitle,
      metaDescription: src.metaDescription,
      price: src.price,
      priceLarge: src.priceLarge,
      compareAtPrice: src.compareAtPrice,
      costPrice: src.costPrice,
      currency: src.currency,
      categoryId: src.categoryId,
      status: "DRAFT",
      featured: false,
      images: { create: src.images.map((i) => ({ url: i.url, alt: i.alt, sortOrder: i.sortOrder })) },
      variants: {
        create: src.variants.map((v) => ({
          sku: `${slug}-${v.colorName}-${v.size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
          colorName: v.colorName,
          colorHex: v.colorHex,
          size: v.size,
          position: v.position,
          stock: 0,
        })),
      },
    },
  });
  await audit(admin, { action: "create", entity: "Product", entityId: copy.id, summary: `Duplicated "${src.name}" → "${copy.name}"` });
  done(`${LIST}/${copy.id}`, "Duplicated as a draft with stock 0 — edit the name, images and stock, then publish");
}

type BulkAction = "publish" | "draft" | "archive" | "restore";

/** Publish / unpublish / archive / restore every selected product. */
export async function bulkProducts(action: BulkAction, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const back = safeBack(formData.get("back"));
  const ids = selectedIds(formData, back);

  let skipped = 0;
  let targets = ids;
  if (action === "publish") {
    // A product with no photo or no variants must not go live.
    const ready = await prisma.product.findMany({
      where: { id: { in: ids }, images: { some: {} }, variants: { some: {} } },
      select: { id: true },
    });
    targets = ready.map((p) => p.id);
    skipped = ids.length - targets.length;
  }

  const data =
    action === "publish" ? { status: "ACTIVE" as const, deletedAt: null, publishedAt: new Date() }
    : action === "draft" ? { status: "DRAFT" as const, deletedAt: null }
    : action === "archive" ? { status: "ARCHIVED" as const, deletedAt: new Date() }
    : { status: "DRAFT" as const, deletedAt: null };

  const r = await prisma.product.updateMany({ where: { id: { in: targets } }, data });
  await audit(admin, { action, entity: "Product", summary: `Bulk ${action}: ${r.count} product${r.count === 1 ? "" : "s"}` });

  const verb = { publish: "published", draft: "moved to drafts", archive: "archived", restore: "restored as drafts" }[action];
  done(back, `${r.count} product${r.count === 1 ? "" : "s"} ${verb}${skipped ? ` · ${skipped} skipped (need at least one image and one variant)` : ""}`);
}

const PUBLIC_PREFIX = "/storage/v1/object/public/products/";

/** Removes uploaded image files from storage unless another product still points at the same file. */
async function removeUnusedImages(urls: string[]) {
  const paths = new Set<string>();
  for (const url of urls) {
    const i = url.indexOf(PUBLIC_PREFIX);
    if (i === -1) continue;
    const stillUsed = await prisma.productImage.count({ where: { url } });
    if (stillUsed === 0) paths.add(decodeURIComponent(url.slice(i + PUBLIC_PREFIX.length).split("?")[0]));
  }
  if (paths.size) await createAdminClient().storage.from("products").remove([...paths]).catch(() => undefined);
}

async function deleteProducts(ids: string[]) {
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, status: true, images: { select: { url: true } } },
  });
  // Live products must be archived first, so a live item can't vanish with a single click.
  const deletable = rows.filter((p) => p.status !== "ACTIVE");
  const blocked = rows.length - deletable.length;

  const urls = deletable.flatMap((p) => p.images.map((i) => i.url));
  // Past orders keep their own copy of name/price/image; only the live link is cleared.
  await prisma.product.deleteMany({ where: { id: { in: deletable.map((p) => p.id) } } });
  await removeUnusedImages(urls);
  return { deleted: deletable, blocked };
}

export async function deleteProductPermanently(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:delete");
  const back = `${LIST}/${id}`;
  if (formData.get("confirm") !== "DELETE") redirect(withMessage(back, "error", "Type DELETE to confirm"));

  const { deleted, blocked } = await deleteProducts([id]);
  if (blocked) redirect(withMessage(back, "error", "Archive this product first, then delete it."));
  await audit(admin, { action: "delete", entity: "Product", entityId: id, summary: `Permanently deleted product "${deleted[0]?.name}"` });
  done(LIST, `"${deleted[0]?.name}" permanently deleted`);
}

export async function bulkDeleteProducts(formData: FormData) {
  const admin = await requireAdmin("catalog:delete");
  const back = safeBack(formData.get("back"));
  if (formData.get("confirm") !== "DELETE") redirect(withMessage(back, "error", "Type DELETE to confirm"));
  const ids = selectedIds(formData, back);

  const { deleted, blocked } = await deleteProducts(ids);
  await audit(admin, { action: "delete", entity: "Product", summary: `Permanently deleted ${deleted.length} product(s): ${deleted.map((p) => p.name).join(", ")}`.slice(0, 480) });
  if (deleted.length === 0) redirect(withMessage(back, "error", "Live products must be archived before they can be deleted."));
  done(back, `${deleted.length} permanently deleted${blocked ? ` · ${blocked} live product${blocked === 1 ? "" : "s"} skipped (archive first)` : ""}`);
}
