import Link from "next/link";

import { ExportLink, PageHeader, Pagination, Table, td, th, btnGhostCls, inputCls } from "@/components/admin/ui";
import { dateTime, money } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Customers" };
const PAGE_SIZE = 25;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin("customers:view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = sp.q
    ? {
        OR: [
          { name: { contains: sp.q, mode: "insensitive" as const } },
          { email: { contains: sp.q, mode: "insensitive" as const } },
          { phone: { contains: sp.q } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { orders: { select: { total: true, status: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${total} customers`}
        actions={<ExportLink kind="customers" />}
      />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Name, email, phone…" className={`${inputCls} max-w-xs`} />
        <button className={btnGhostCls}>Search</button>
      </form>
      <Table>
        <thead>
          <tr>
            <th className={th}>Name</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>Orders</th>
            <th className={th}>Spent</th>
            <th className={th}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const valid = c.orders.filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status));
            return (
              <tr key={c.id}>
                <td className={td}><Link href={`/admin/customers/${c.id}`} className="font-medium hover:underline">{c.name}</Link></td>
                <td className={td}>{c.email}</td>
                <td className={td}>{c.phone ?? "—"}</td>
                <td className={td}>{c.orders.length}</td>
                <td className={td}>{money(valid.reduce((n, o) => n + Number(o.total), 0))}</td>
                <td className={td}>{dateTime(c.createdAt)}</td>
              </tr>
            );
          })}
          {customers.length === 0 && (
            <tr><td className={td} colSpan={6}>No customers yet.</td></tr>
          )}
        </tbody>
      </Table>
      <Pagination base="/admin/customers" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q: sp.q }} />
    </>
  );
}
