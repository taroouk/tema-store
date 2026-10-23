import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BarList, SalesChart, type DayPoint } from "@/components/admin/charts";
import { Badge, Card, orderTone, PageHeader, Table, td, th } from "@/components/admin/ui";
import { dateTime, money } from "@/lib/admin/format";
import { can } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Dashboard" };

const RANGES = [7, 30, 90] as const;
const COUNTED = { notIn: ["CANCELLED", "REFUNDED"] as ("CANCELLED" | "REFUNDED")[] };

function Stat({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  delta?: number | null;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
        {delta !== undefined && delta !== null && (
          <span className={`inline-flex items-center font-medium ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
            {delta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint}
      </div>
    </Card>
  );
}

const pct = (now: number, prev: number) => (prev === 0 ? null : Math.round(((now - prev) / prev) * 100));

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; range?: string }>;
}) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const range = RANGES.find((r) => String(r) === sp.range) ?? 30;
  const canOrders = can(admin.role, "orders:manage");
  const canCatalog = can(admin.role, "catalog:write");
  const canCustomers = can(admin.role, "customers:view");

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (range - 1));
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - range);

  const [verifyCount, orders, prevOrders, newCustomers, prevCustomers, statusGroups, topItems, recent, lowStock, productCount] =
    await Promise.all([
      canOrders ? prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }) : 0,
      canOrders
        ? prisma.order.findMany({
            where: { createdAt: { gte: start }, status: COUNTED },
            select: { createdAt: true, total: true },
          })
        : [],
      canOrders
        ? prisma.order.findMany({
            where: { createdAt: { gte: prevStart, lt: start }, status: COUNTED },
            select: { total: true },
          })
        : [],
      canCustomers ? prisma.customer.count({ where: { createdAt: { gte: start } } }) : 0,
      canCustomers ? prisma.customer.count({ where: { createdAt: { gte: prevStart, lt: start } } }) : 0,
      canOrders ? prisma.order.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: start } } }) : [],
      canOrders
        ? prisma.orderItem.groupBy({
            by: ["name"],
            _sum: { quantity: true },
            where: { order: { createdAt: { gte: start }, status: COUNTED } },
            orderBy: { _sum: { quantity: "desc" } },
            take: 5,
          })
        : [],
      canOrders ? prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }) : [],
      canCatalog
        ? prisma.productVariant.findMany({
            where: { stock: { lte: 5 }, product: { deletedAt: null, status: "ACTIVE" } },
            include: { product: { select: { id: true, name: true } } },
            orderBy: { stock: "asc" },
            take: 6,
          })
        : [],
      canCatalog ? prisma.product.count({ where: { deletedAt: null, status: "ACTIVE" } }) : 0,
    ]);

  const sales = orders.reduce((n, o) => n + Number(o.total), 0);
  const prevSales = prevOrders.reduce((n, o) => n + Number(o.total), 0);
  const aov = orders.length ? sales / orders.length : 0;
  const prevAov = prevOrders.length ? prevSales / prevOrders.length : 0;

  const points: DayPoint[] = Array.from({ length: range }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      date: d.toDateString(),
      sales: 0,
      orders: 0,
    };
  });
  const index = new Map(points.map((p, i) => [p.date, i]));
  for (const o of orders) {
    const p = points[index.get(o.createdAt.toDateString()) ?? -1];
    if (p) {
      p.sales += Number(o.total);
      p.orders++;
    }
  }

  const TONES: Record<string, string> = {
    PENDING: "bg-amber-500",
    CONFIRMED: "bg-blue-500",
    PROCESSING: "bg-blue-500",
    SHIPPED: "bg-indigo-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
    REFUNDED: "bg-neutral-400",
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${admin.name.split(" ")[0]}`}
        description={`Store performance for the last ${range} days.`}
        actions={
          canOrders && (
            <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5 text-sm">
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/admin?range=${r}`}
                  className={`rounded px-3 py-1.5 ${r === range ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {r}d
                </Link>
              ))}
            </div>
          )
        }
      />
      {sp.denied && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your role doesn&apos;t have access to that section.
        </div>
      )}

      {verifyCount > 0 && (
        <Link
          href="/admin/orders?pay=verify"
          className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 hover:bg-blue-100"
        >
          <span><strong>{verifyCount}</strong> transfer payment{verifyCount === 1 ? "" : "s"} waiting for your confirmation</span>
          <span>Review →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canOrders && (
          <>
            <Stat label="Sales" value={money(sales)} delta={pct(sales, prevSales)} hint="vs previous period" />
            <Stat label="Orders" value={orders.length} delta={pct(orders.length, prevOrders.length)} hint="excl. cancelled" />
            <Stat label="Avg. order value" value={money(Math.round(aov))} delta={pct(aov, prevAov)} />
          </>
        )}
        {canCustomers && <Stat label="New customers" value={newCustomers} delta={pct(newCustomers, prevCustomers)} />}
        {!canOrders && canCatalog && <Stat label="Active products" value={productCount} />}
      </div>

      {canOrders && (
        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Card title={`Daily sales — last ${range} days`} className="xl:col-span-2">
            <SalesChart data={points} />
          </Card>
          <Card title="Orders by status">
            {statusGroups.length ? (
              <BarList
                items={statusGroups.map((g) => ({
                  label: g.status.charAt(0) + g.status.slice(1).toLowerCase(),
                  value: g._count,
                  tone: TONES[g.status],
                }))}
              />
            ) : (
              <p className="text-sm text-neutral-500">No orders in this period.</p>
            )}
          </Card>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {canOrders && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent orders</h2>
                <Link href="/admin/orders" className="text-xs text-neutral-500 hover:text-neutral-900">View all →</Link>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Total</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className={td}>
                        <Link className="font-medium hover:underline" href={`/admin/orders/${o.id}`}>#{o.number}</Link>
                        <p className="text-xs text-neutral-500">{dateTime(o.createdAt)}</p>
                      </td>
                      <td className={td}>{o.customerName}</td>
                      <td className={td}>{money(o.total, o.currency)}</td>
                      <td className={td}><Badge tone={orderTone[o.status]}>{o.status.toLowerCase()}</Badge></td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr><td className={`${td} py-8 text-center text-neutral-500`} colSpan={4}>No orders yet. They will appear here as customers check out.</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
            <Card title="Top products (units sold)">
              {topItems.length ? (
                <BarList items={topItems.map((t) => ({ label: t.name, value: t._sum.quantity ?? 0 }))} />
              ) : (
                <p className="text-sm text-neutral-500">No sales in this period.</p>
              )}
            </Card>
          </>
        )}
        {canCatalog && (
          <div className="xl:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Low stock</h2>
              <Link href="/admin/inventory" className="text-xs text-neutral-500 hover:text-neutral-900">Inventory →</Link>
            </div>
            <Table>
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={th}>Variant</th>
                  <th className={th}>Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((v) => (
                  <tr key={v.id}>
                    <td className={td}><Link className="hover:underline" href={`/admin/products/${v.product.id}`}>{v.product.name}</Link></td>
                    <td className={td}>{v.colorName} / {v.size}</td>
                    <td className={td}><Badge tone={v.stock === 0 ? "red" : "amber"}>{v.stock}</Badge></td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td className={`${td} py-8 text-center text-neutral-500`} colSpan={3}>Everything is well stocked.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
