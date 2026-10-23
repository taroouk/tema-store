import type { Metadata } from "next";
import { Suspense } from "react";
import { ThemedToaster } from "@/components/theme/themed-toaster";

import { FlashToast } from "@/components/admin/form-controls";
import { AdminShell, type NavLink } from "@/components/admin/shell";
import { signOut } from "@/app/admin/login/actions";
import { can, ROLE_LABELS } from "@/lib/auth/permissions";
import { requireAdmin } from "@/lib/auth/session";

import "../admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Tema Label Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  const links: NavLink[] = [
    { href: "/admin", label: "Dashboard", icon: "dashboard", section: "Overview" },
  ];
  if (can(admin.role, "catalog:write")) {
    links.push(
      { href: "/admin/products", label: "Products", icon: "products", section: "Catalog" },
      { href: "/admin/categories", label: "Categories", icon: "categories", section: "Catalog" },
      { href: "/admin/inventory", label: "Inventory", icon: "inventory", section: "Catalog" },
      { href: "/admin/collections", label: "Collections", icon: "collections", section: "Catalog" },
      { href: "/admin/pages", label: "Policy pages", icon: "pages", section: "Content" },
      { href: "/admin/faq", label: "FAQ", icon: "faq", section: "Content" }
    );
  }
  if (can(admin.role, "orders:manage"))
    links.push({ href: "/admin/orders", label: "Orders", icon: "orders", section: "Sales" });
  if (can(admin.role, "customers:view"))
    links.push({ href: "/admin/customers", label: "Customers", icon: "customers", section: "Sales" });
  if (can(admin.role, "customers:view"))
    links.push({ href: "/admin/messages", label: "Messages", icon: "messages", section: "Sales" });
  if (can(admin.role, "marketing:manage"))
    links.push(
      { href: "/admin/coupons", label: "Coupons", icon: "coupons", section: "Sales" },
      { href: "/admin/subscribers", label: "Subscribers", icon: "subscribers", section: "Sales" }
    );
  if (can(admin.role, "reports:view"))
    links.push({ href: "/admin/reports", label: "Reports", icon: "reports", section: "Overview" });
  if (can(admin.role, "settings:manage"))
    links.push({ href: "/admin/settings", label: "Settings", icon: "settings", section: "System" });
  if (can(admin.role, "audit:view"))
    links.push({ href: "/admin/audit", label: "Activity log", icon: "audit", section: "System" });
  if (can(admin.role, "admins:manage"))
    links.push({ href: "/admin/admins", label: "Admins", icon: "admins", section: "System" });

  return (
    <div className="admin-root">
      <AdminShell
        links={links}
        signOutAction={signOut}
        user={{ name: admin.name, email: admin.email, role: ROLE_LABELS[admin.role] }}
      >
        {children}
      </AdminShell>
      <Suspense>
        <FlashToast />
      </Suspense>
      <ThemedToaster position="top-right" />
    </div>
  );
}
