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

const BACK = "/admin/collections";

const Input = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000),
  coverImage: z.string().trim().max(500).optional(),
  position: z.coerce.number().int().min(0).max(10_000),
});

function parse(formData: FormData) {
  const r = Input.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") ?? "",
    coverImage: formData.get("coverImage") || undefined,
    position: formData.get("position") || 0,
  });
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));
  return {
    ...r.data,
    slug: slugify(r.data.slug || r.data.title),
    isActive: formData.get("isActive") === "on",
    productIds: formData.getAll("productIds").filter((v): v is string => typeof v === "string"),
  };
}

export async function createCollection(formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const { productIds, ...data } = parse(formData);
  try {
    const c = await prisma.collection.create({
      data: {
        ...data,
        productCollections: { create: productIds.map((productId, position) => ({ productId, position })) },
      },
    });
    await audit(admin, { action: "create", entity: "Collection", entityId: c.id, summary: `Created collection "${c.title}"` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "Slug already exists"));
    }
    throw e;
  }
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Collection created"));
}

export async function updateCollection(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const { productIds, ...data } = parse(formData);
  try {
    await prisma.$transaction([
      prisma.productCollection.deleteMany({ where: { collectionId: id } }),
      prisma.collection.update({
        where: { id },
        data: {
          ...data,
          productCollections: { create: productIds.map((productId, position) => ({ productId, position })) },
        },
      }),
    ]);
    await audit(admin, { action: "update", entity: "Collection", entityId: id, summary: `Updated collection "${data.title}"` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "Slug already exists"));
    }
    throw e;
  }
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Collection saved"));
}

export async function deleteCollection(id: string) {
  const admin = await requireAdmin("catalog:write");
  const c = await prisma.collection.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "Collection", entityId: id, summary: `Deleted collection "${c.title}"` });
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Collection deleted"));
}
