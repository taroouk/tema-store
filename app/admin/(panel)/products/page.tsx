import Link from "next/link";

import { ExportLink,
  Badge,
  btnCls,
  btnGhostCls,
  inputCls,
  PageHeader,
  Pagination,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { money } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Products" };
const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; ok?: string; error?: string }>;
}) {
  await requireAdmin("catalog:write");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = ["DRAFT", "ACTIVE", "ARCHIVED"].includes(sp.status ?? "")
    ? (sp.status as "DRAFT" | "ACTIVE" | "ARCHIVED")
    : undefined;

  const where = {
    ...(status ? { status } : { deletedAt: null }),
    ...(sp.q ? { name: { contains: sp.q, mode: "insensitive" as const } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <>
      <PageHeader
        title="Products"
        description={`${total} products`}
        actions={
          <>
            <ExportLink kind="products" />
            <Link href="/admin/products/new" className={btnCls}>New product</Link>
          </>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Search by name…" className={`${inputCls} max-w-xs`} />
        <select name="status" defaultValue={sp.status ?? ""} className={`${inputCls} max-w-[10rem]`}>
          <option value="">All active</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button className={btnGhostCls}>Filter</button>
      </form>

      <Table>
        <thead>
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Category</th>
            <th className={th}>Price</th>
            <th className={th}>Stock</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((n, v) => n + v.stock, 0);
            return (
              <tr key={p.id}>
                <td className={td}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
                    )}
                    {p.name}
                  </Link>
                </td>
                <td className={td}>{p.category.name}</td>
                <td className={td}>{money(p.price, p.currency)}</td>
                <td className={td}>
                  {stock === 0 ? <Badge tone="red">0</Badge> : stock}
                </td>
                <td className={td}>
                  <Badge tone={p.status === "ACTIVE" ? "green" : p.status === "DRAFT" ? "amber" : "gray"}>
                    {p.status.toLowerCase()}
                  </Badge>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td className={td} colSpan={5}>
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination base="/admin/products" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q: sp.q, status: sp.status }} />
    </>
  );
}
