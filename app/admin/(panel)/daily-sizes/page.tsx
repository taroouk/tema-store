import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { sortSizes } from "@/lib/size-price";

import { SizesBoard, type DsProduct } from "./sizes-board";

export const metadata = { title: "Daily sizes" };

export default async function DailySizesPage() {
  await requireAdmin("catalog:write");

  const rows = await prisma.product.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      variants: { select: { size: true, stock: true, reserved: true, closed: true } },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  const products: DsProduct[] = rows.map((p) => {
    const stock = new Map<string, number>();
    const closed = new Set<string>();
    for (const v of p.variants) {
      stock.set(v.size, (stock.get(v.size) ?? 0) + Math.max(0, v.stock - v.reserved));
      if (v.closed) closed.add(v.size);
    }
    return {
      id: p.id,
      name: p.name,
      image: p.images[0]?.url ?? null,
      category: p.category.name,
      sizes: sortSizes([...stock.keys()]).map((size) => ({ size, stock: stock.get(size)! })),
      closed: [...closed],
    };
  });

  return (
    <>
      <PageHeader
        title="Daily sizes"
        description="Close a size to show an X in the store and block orders for it. Stock in Inventory is never changed."
      />
      <SizesBoard products={products} />
    </>
  );
}
