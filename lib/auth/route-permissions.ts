import type { Permission } from "./permissions";

/** Which permission each admin section needs. Longest prefix wins; unlisted pages only need a login. */
const RULES: [string, Permission][] = [
  ["/admin/products", "catalog:write"],
  ["/admin/inventory", "catalog:write"],
  ["/admin/collections", "catalog:write"],
  ["/admin/categories", "catalog:write"],
  ["/admin/pages", "catalog:write"],
  ["/admin/faq", "catalog:write"],
  ["/admin/orders", "orders:manage"],
  ["/admin/customers", "customers:view"],
  ["/admin/messages", "customers:view"],
  ["/admin/coupons", "marketing:manage"],
  ["/admin/subscribers", "marketing:manage"],
  ["/admin/reports", "reports:view"],
  ["/admin/settings", "settings:manage"],
  ["/admin/audit", "audit:view"],
  ["/admin/admins", "admins:manage"],
];

export function permissionForPath(pathname: string): Permission | undefined {
  return RULES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1];
}
