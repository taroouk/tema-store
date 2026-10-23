import Link from "next/link";

import {
  ExportLink,
  Badge,
  btnGhostCls,
  inputCls,
  orderTone,
  PageHeader,
  Pagination,
  paymentTone,
  Table,
  td,
  th,
} from "@/components/admin/ui";
import { dateTime, money } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Orders" };
const PAGE_SIZE = 25;
const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; pay?: string }>;
}) {
  await requireAdmin("orders:manage");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = STATUSES.find((s) => s === sp.status);
  const num = Number(sp.q);

  const verify = sp.pay === "verify";
  const where = {
    ...(status ? { status } : {}),
    ...(verify ? { paymentStatus: "AWAITING_VERIFICATION" as const } : {}),
    ...(sp.q
      ? {
          OR: [
            ...(Number.isInteger(num) && num > 0 && num < 2_000_000_000 ? [{ number: num }] : []),
            { email: { contains: sp.q, mode: "insensitive" as const } },
            { customerName: { contains: sp.q, mode: "insensitive" as const } },
            { phone: { contains: sp.q } },
          ],
        }
      : {}),
  };

  const [orders, total, counts, toVerify] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
  ]);
  const countOf = new Map(counts.map((c) => [c.status, c._count]));
  const all = counts.reduce((n, c) => n + c._count, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${total} orders`}
        actions={<ExportLink kind="orders" />}
      />
      {toVerify > 0 && (
        <Link
          href="/admin/orders?pay=verify"
          className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 hover:bg-blue-100"
        >
          <span><strong>{toVerify}</strong> transfer payment{toVerify === 1 ? "" : "s"} waiting for your confirmation</span>
          <span>{verify ? "Showing these →" : "Review →"}</span>
        </Link>
      )}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-neutral-200">
        {[{ key: "", label: "All", n: all }, ...STATUSES.map((s) => ({ key: s, label: s.charAt(0) + s.slice(1).toLowerCase(), n: countOf.get(s) ?? 0 }))].map((t) => (
          <Link
            key={t.key}
            href={`/admin/orders${t.key ? `?status=${t.key}` : ""}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${(sp.status ?? "") === t.key ? "border-neutral-900 font-medium text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            {t.label} <span className="text-xs text-neutral-400">{t.n}</span>
          </Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={sp.q} placeholder="Order #, name, email, phone…" className={`${inputCls} max-w-xs`} />
        <button className={btnGhostCls}>Search</button>
      </form>
      <Table>
        <thead>
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Date</th>
            <th className={th}>Customer</th>
            <th className={th}>Items</th>
            <th className={th}>Total</th>
            <th className={th}>Payment</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className={td}>
                <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                  #{o.number}
                </Link>
              </td>
              <td className={td}>{dateTime(o.createdAt)}</td>
              <td className={td}>{o.customerName}</td>
              <td className={td}>{o._count.items}</td>
              <td className={td}>{money(o.total, o.currency)}</td>
              <td className={td}>
                <Badge tone={paymentTone[o.paymentStatus]}>{o.paymentStatus === "AWAITING_VERIFICATION" ? "verify" : o.paymentStatus.toLowerCase()}</Badge>
                <span className="ml-2 text-xs text-neutral-500">{o.paymentMethod === "COD" ? "COD" : o.paymentMethod === "INSTAPAY" ? "InstaPay" : "Wallet"}</span>
              </td>
              <td className={td}>
                <Badge tone={orderTone[o.status]}>{o.status.toLowerCase()}</Badge>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td className={td} colSpan={7}>
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination base="/admin/orders" page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q: sp.q, status: sp.status }} />
    </>
  );
}
