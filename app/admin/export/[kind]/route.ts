import { can, type Permission } from "@/lib/auth/permissions";
import { getAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

/** Neutralises spreadsheet formula injection and quotes fields. */
function cell(value: unknown) {
  let s = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const toCsv = (header: string[], rows: unknown[][]) =>
  "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

const KINDS: Record<string, { permission: Permission; build: () => Promise<string> }> = {
  orders: {
    permission: "orders:manage",
    build: async () => {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10_000 });
      return toCsv(
        ["Order", "Date", "Customer", "Email", "Phone", "Status", "Payment", "Method", "Sender", "Reference", "Subtotal", "Shipping", "Discount", "Total", "Currency"],
        orders.map((o) => [o.number, o.createdAt, o.customerName, o.email, o.phone, o.status, o.paymentStatus, o.paymentMethod, o.paymentSender, o.paymentReference, o.subtotal, o.shippingFee, o.discount, o.total, o.currency])
      );
    },
  },
  products: {
    permission: "catalog:write",
    build: async () => {
      const variants = await prisma.productVariant.findMany({
        where: { product: { deletedAt: null } },
        include: { product: { include: { category: true } } },
        orderBy: [{ product: { name: "asc" } }, { position: "asc" }],
        take: 20_000,
      });
      return toCsv(
        ["Product", "Category", "Status", "SKU", "Color", "Size", "Price", "Stock"],
        variants.map((v) => [v.product.name, v.product.category.name, v.product.status, v.sku, v.colorName, v.size, v.product.price, v.stock])
      );
    },
  },
  subscribers: {
    permission: "marketing:manage",
    build: async () => {
      const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50_000 });
      return toCsv(["Email", "Status", "Source", "Subscribed"], subs.map((s) => [s.email, s.isActive ? "active" : "unsubscribed", s.source, s.createdAt]));
    },
  },
  customers: {
    permission: "customers:view",
    build: async () => {
      const customers = await prisma.customer.findMany({
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
        take: 20_000,
      });
      return toCsv(
        ["Name", "Email", "Phone", "Orders", "Joined"],
        customers.map((c) => [c.name, c.email, c.phone, c._count.orders, c.createdAt])
      );
    },
  },
};

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const admin = await getAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { kind } = await params;
  const spec = KINDS[kind];
  if (!spec) return new Response("Not found", { status: 404 });
  if (!can(admin.role, spec.permission)) return new Response("Forbidden", { status: 403 });

  const csv = await spec.build();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tema-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
