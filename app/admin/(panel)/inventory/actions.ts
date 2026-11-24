"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog";
import { prisma } from "@/lib/prisma/client";

const Input = z.object({
  variantId: z.string().uuid(),
  stock: z.number().int().min(0).max(1_000_000),
});

/** Sets the stock of one size. Throws on bad input so the client can roll back. */
export async function setVariantStock(variantId: string, stock: number) {
  const admin = await requireAdmin("catalog:write");
  const input = Input.parse({ variantId, stock });

  const before = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    select: { stock: true, size: true, productId: true, product: { select: { name: true } } },
  });
  if (!before) throw new Error("That size no longer exists");
  if (before.stock === input.stock) return { ok: true as const };

  await prisma.productVariant.update({ where: { id: input.variantId }, data: { stock: input.stock } });
  await audit(admin, {
    action: "stock",
    entity: "Product",
    entityId: before.productId,
    summary: `Stock "${before.product.name}" / ${before.size}: ${before.stock} → ${input.stock}`,
  });

  updateTag(CATALOG_TAG);
  return { ok: true as const };
}
