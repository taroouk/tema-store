"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog";
import { prisma } from "@/lib/prisma/client";

const Input = z.object({
  productId: z.string().uuid(),
  sizes: z.array(z.string().min(1).max(20)).min(1).max(40),
  closed: z.boolean(),
});

/** Opens or closes sizes of one product. Never touches stock. */
export async function setSizesClosed(productId: string, sizes: string[], closed: boolean) {
  const admin = await requireAdmin("catalog:write");
  const input = Input.parse({ productId, sizes, closed });

  const r = await prisma.productVariant.updateMany({
    where: { productId: input.productId, size: { in: input.sizes } },
    data: { closed: input.closed },
  });
  await audit(admin, {
    action: "sizes",
    entity: "Product",
    entityId: input.productId,
    summary: `${input.closed ? "Closed" : "Opened"} size ${input.sizes.join(", ")} (${r.count} variants)`,
  });

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/daily-sizes");
  return { ok: true as const };
}

/** Opens every closed size in the store (start-of-day reset). */
export async function openAllSizes() {
  const admin = await requireAdmin("catalog:write");
  const r = await prisma.productVariant.updateMany({ where: { closed: true }, data: { closed: false } });
  await audit(admin, { action: "sizes", entity: "Product", summary: `Opened all closed sizes (${r.count} variants)` });

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/daily-sizes");
  return { ok: true as const };
}
