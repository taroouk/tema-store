import Link from "next/link";

import { BarList, SalesChart, type DayPoint } from "@/components/admin/charts";
import { ExportLink, Card, PageHeader, Table, td, th } from "@/components/admin/ui";
import { money } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Reports" };

const RANGES = [30, 90, 180, 365] as const;
const COUNTED = { notIn: ["CANCELLED", "REFUNDED"] as ("CANCELLED" | "REFUNDED")[] };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin("reports:view");
  const sp = await searchParams;
  const range = RANGES.find((r) => String(r) === sp.range) ?? 90;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (range - 1));

  const [orders, items, customers, coupons] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: COUNTED },
      select: { createdAt: true, total: true, paymentMethod: true, customerId: true, customerName: true, email: true, phone: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since }, status: COUNTED } },
      select: { quantity: true, unitPrice: true, product: { select: { category: { select: { name: true } } } } },
    }),
    prisma.customer.count({ where: { createdAt: { gte: since } } }),
    prisma.order.groupBy({
      by: ["couponCode"],
      where: { createdAt: { gte: since }, status: COUNTED, couponCode: { not: null } },
      _count: true,
      _sum: { discount: true },
    }),
  ]);

  const sales = orders.reduce((n, o) => n + Number(o.total), 0);

  // Bucket by month for long ranges, by day for the shortest.
  const monthly = range > 30;
  const buckets = new Map<string, DayPoint>();
  for (const o of orders) {
    const d = o.createdAt;
    const key = monthly ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : d.toDateString();
    const label = monthly ? d.toLocaleString("en-GB", { month: "short" }) : `${d.getDate()}/${d.getMonth() + 1}`;
    const b = buckets.get(key) ?? { label, date: key, sales: 0, orders: 0 };
    b.sales += Number(o.total);
    b.orders++;
    buckets.set(key, b);
  }
  const series = [...buckets.values()].sort((a, b) => (a.date < b.date ? -1 : 1));

  const byCategory = new Map<string, number>();
  for (const i of items) {
    const name = i.product?.category.name ?? "Deleted products";
    byCategory.set(name, (byCategory.get(name) ?? 0) + Number(i.unitPrice) * i.quantity);
  }

  const byMethod = new Map<string, number>();
  const byCustomer = new Map<string, { name: string; contact: string; total: number; orders: number }>();
  for (const o of orders) {
    byMethod.set(o.paymentMethod, (byMethod.get(o.paymentMethod) ?? 0) + 1);
    const k = o.customerId ?? o.email ?? o.phone;
    const c = byCustomer.get(k) ?? { name: o.customerName, contact: o.email ?? o.phone, total: 0, orders: 0 };
    c.total += Number(o.total);
    c.orders++;
    byCustomer.set(k, c);
  }
  const top = [...byCustomer.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  const repeat = [...byCustomer.values()].filter((c) => c.orders > 1).length;

  return (
    <>
      <PageHeader
        title="Reports"
        description={`Performance over the last ${range} days (cancelled and refunded orders excluded).`}
        actions={
          <>
            <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5 text-sm">
              {RANGES.map((r) => (
                <Link key={r} href={`/admin/reports?range=${r}`} className={`rounded px-3 py-1.5 ${r === range ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  {r}d
                </Link>
              ))}
            </div>
            <ExportLink kind="orders" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-neutral-500">Sales</p><p className="mt-1 text-2xl font-semibold tabular-nums">{money(sales)}</p></Card>
        <Card><p className="text-sm text-neutral-500">Orders</p><p className="mt-1 text-2xl font-semibold tabular-nums">{orders.length}</p></Card>
        <Card><p className="text-sm text-neutral-500">New customers</p><p className="mt-1 text-2xl font-semibold tabular-nums">{customers}</p></Card>
        <Card><p className="text-sm text-neutral-500">Repeat buyers</p><p className="mt-1 text-2xl font-semibold tabular-nums">{repeat}</p><p className="mt-1 text-xs text-neutral-500">of {byCustomer.size} buyers</p></Card>
      </div>

      <Card title={monthly ? "Sales by month" : "Sales by day"} className="mt-6">
        {series.length ? <SalesChart data={series} /> : <p className="text-sm text-neutral-500">No sales in this period.</p>}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Sales by category">
          {byCategory.size ? (
            <BarList items={[...byCategory].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, display: money(value) }))} />
          ) : (
            <p className="text-sm text-neutral-500">No data yet.</p>
          )}
        </Card>
        <Card title="Payment methods">
          {byMethod.size ? (
            <BarList items={[...byMethod].map(([label, value]) => ({ label, value, display: `${value} orders` }))} />
          ) : (
            <p className="text-sm text-neutral-500">No data yet.</p>
          )}
        </Card>
        <Card title="Coupon usage">
          {coupons.length ? (
            <BarList items={coupons.map((c) => ({ label: c.couponCode ?? "", value: c._count, display: `${c._count} · −${money(c._sum.discount ?? 0)}` }))} />
          ) : (
            <p className="text-sm text-neutral-500">No coupons used.</p>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Top customers</h2>
        <Table>
          <thead><tr><th className={th}>Customer</th><th className={th}>Orders</th><th className={th}>Spent</th></tr></thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.contact}>
                <td className={td}>{c.name}<p className="text-xs text-neutral-500">{c.contact}</p></td>
                <td className={td}>{c.orders}</td>
                <td className={td}>{money(c.total)}</td>
              </tr>
            ))}
            {top.length === 0 && <tr><td className={`${td} py-8 text-center text-neutral-500`} colSpan={3}>No customers in this period.</td></tr>}
          </tbody>
        </Table>
      </div>
    </>
  );
}
