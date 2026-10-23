import type { AdminRole } from "@prisma/client";

export type Permission =
  | "catalog:write"
  | "orders:manage"
  | "customers:view"
  | "admins:manage"
  | "audit:view"
  | "marketing:manage"
  | "settings:manage"
  | "reports:view";

const MATRIX: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: ["catalog:write", "orders:manage", "customers:view", "admins:manage", "audit:view", "marketing:manage", "settings:manage", "reports:view"],
  ADMIN: ["catalog:write", "orders:manage", "customers:view", "audit:view", "marketing:manage", "settings:manage", "reports:view"],
  EDITOR: ["catalog:write"],
  SUPPORT: ["orders:manage", "customers:view"],
};

export function can(role: AdminRole, permission: Permission) {
  return MATRIX[role].includes(permission);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  SUPPORT: "Support",
};
