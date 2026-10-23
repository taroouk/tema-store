import "server-only";

import type { Prisma } from "@prisma/client";

/**
 * Gives an order's reserved stock back and frees its coupon use. Call it exactly once, when an order
 * moves into CANCELLED/REFUNDED (the callers check the previous status).
 */
export async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  order: { items: { variantId: string | null; quantity: number }[]; couponCode: string | null }
) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
  }
  if (order.couponCode) {
    await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = GREATEST("usedCount" - 1, 0) WHERE "code" = ${order.couponCode}`;
  }
}
