import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { sortSizes } from "@/lib/size-price";

import { InventoryBoard, type InvProduct } from "./inventory-board";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  await requireAdmin("catalog:write");

  const rows = await prisma.product.findMany({
    where: { deletedAt: null, status: { not: "ARCHIVED" } },
    select: {
      id: true,
      name: true,
      status: true,
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      variants: { select: { id: true, size: true, sku: true, stock: true, lowStockAt: true, closed: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  const products: InvProduct[] = rows.map((p) => {
    const order = sortSizes([...new Set(p.variants.map((v) => v.size))]);
    return {
      id: p.id,
      name: p.name,
      image: p.images[0]?.url ?? null,
      category: p.category.name,
      published: p.status === "ACTIVE",
      variants: [...p.variants].sort((a, b) => order.indexOf(a.size) - order.indexOf(b.size)),
    };
  });

  return (
    <>
      <PageHeader title="Inventory" description="Edit the quantity of every size. Closing a size is done in Daily sizes and never changes these numbers." />
      <InventoryBoard products={products} />
    </>
  );
}
