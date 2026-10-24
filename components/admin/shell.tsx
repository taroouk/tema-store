"use client";

import {
  BarChart3,
  Boxes,
  FileText,
  HelpCircle,
  Inbox,
  Mail,
  Settings,
  Tag,
  TicketPercent,
  ChevronRight,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LiveIndicator } from "@/components/admin/live-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const ICONS = {
  dashboard: LayoutDashboard,
  products: Package,
  inventory: Boxes,
  collections: Layers,
  orders: ShoppingBag,
  customers: Users,
  audit: History,
  admins: ShieldCheck,
  categories: Tag,
  coupons: TicketPercent,
  reports: BarChart3,
  settings: Settings,
  messages: Inbox,
  subscribers: Mail,
  pages: FileText,
  faq: HelpCircle,
} as const;

export interface NavLink {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  section: "Overview" | "Catalog" | "Sales" | "Content" | "System";
}

const SECTIONS = ["Overview", "Catalog", "Sales", "Content", "System"] as const;

function titleFor(pathname: string, links: NavLink[]) {
  const hit = [...links]
    .sort((a, b) => b.href.length - a.href.length)
    .find((l) => (l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href)));
  return hit;
}

export function AdminShell({
  links,
  user,
  signOutAction,
  children,
}: {
  links: NavLink[];
  user: { name: string; email: string; role: string };
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The drawer is tied to the path it was opened on, so navigating closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);

  const current = titleFor(pathname, links);
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Admin">
      {SECTIONS.map((section) => {
        const items = links.filter((l) => l.section === section);
        if (!items.length) return null;
        return (
          <div key={section}>
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map((l) => {
                const Icon = ICONS[l.icon];
                const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-neutral-900 font-medium text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <Icon size={16} aria-hidden />
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-6">
          <span className="text-lg font-semibold tracking-[0.08em]">Tema Label</span>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-neutral-500">
            Admin
          </span>
        </div>
        {nav}
        <div className="border-t border-neutral-200 p-3">
          <Link href="/" target="_blank" className="mb-2 block rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
            View storefront ↗
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
              <span className="text-lg font-semibold tracking-[0.08em]">Tema Label</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div className="flex min-w-0 items-center gap-1 text-sm text-neutral-500">
            <span>Admin</span>
            {current && current.href !== "/admin" && (
              <>
                <ChevronRight size={14} aria-hidden />
                <span className="truncate font-medium text-neutral-900">{current.label}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LiveIndicator />
            <ThemeToggle className="rounded-md border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100 hover:opacity-100" />
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.role}</p>
            </div>
            <Link
              href="/admin/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white"
              title={`${user.email} — profile`}
            >
              {initials}
            </Link>
            <form action={signOutAction}>
              <button
                className="rounded-md border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
