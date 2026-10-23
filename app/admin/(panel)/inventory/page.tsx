import Link from "next/link";

import { Badge, PageHeader, Table, td, th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  await requireAdmin("catalog:write");

  const variants = await prisma.productVariant.findMany({
    where: { product: { deletedAt: null, status: { not: "ARCHIVED" } } },
    include: { product: { select: { id: true, name: true } } },
    orderBy: [{ stock: "asc" }, { sku: "asc" }],
    take: 200,
  });
  const low = variants.filter((v) => v.stock <= v.lowStockAt);

  return (
    <>
      <PageHeader
        title="Inventory"
        description={`${low.length} variants are low or out of stock (showing the 200 lowest)`}
      />
      <Table>
        <thead>
          <tr>
            <th className={th}>Product</th>
            <th className={th}>SKU</th>
            <th className={th}>Variant</th>
            <th className={th}>Stock</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id}>
              <td className={td}>
                <Link href={`/admin/products/${v.product.id}`} className="hover:underline">
                  {v.product.name}
                </Link>
              </td>
              <td className={`${td} font-mono text-xs`}>{v.sku}</td>
              <td className={td}>{v.colorName} / {v.size}</td>
              <td className={td}>{v.stock}</td>
              <td className={td}>
                {v.stock === 0 ? <Badge tone="red">Out</Badge> : v.stock <= v.lowStockAt ? <Badge tone="amber">Low</Badge> : <Badge tone="green">OK</Badge>}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
