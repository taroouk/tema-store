"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { slugify, withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog";
import { prisma } from "@/lib/prisma/client";

const BACK = "/admin/categories";
const Input = z.object({ name: z.string().trim().min(2).max(60), slug: z.string().trim().max(60).optional() });

function parse(formData: FormData) {
  const r = Input.safeParse({ name: formData.get("name"), slug: formData.get("slug") || undefined });
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));
  return { name: r.data.name, slug: slugify(r.data.slug || r.data.name) };
}

export async function createCategory(formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const data = parse(formData);
  try {
    const c = await prisma.category.create({ data });
    await audit(admin, { action: "create", entity: "Category", entityId: c.id, summary: `Created category "${c.name}"` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "A category with that slug already exists"));
    }
    throw e;
  }
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Category created"));
}

export async function updateCategory(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const data = parse(formData);
  try {
    await prisma.category.update({ where: { id }, data });
    await audit(admin, { action: "update", entity: "Category", entityId: id, summary: `Updated category "${data.name}"` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "A category with that slug already exists"));
    }
    throw e;
  }
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Category saved"));
}

export async function deleteCategory(id: string) {
  const admin = await requireAdmin("catalog:write");
  const category = await prisma.category.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (category._count.products > 0) {
    redirect(withMessage(BACK, "error", `Move or delete its ${category._count.products} products first`));
  }
  await prisma.category.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "Category", entityId: id, summary: `Deleted category "${category.name}"` });
  updateTag(CATALOG_TAG);
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Category deleted"));
}
