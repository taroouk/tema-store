import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

export const btnCls =
  "inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50";

export const btnGhostCls =
  "inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100";

export const btnDangerCls =
  "inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-white p-5 ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold text-neutral-900">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

const TONES = {
  gray: "bg-neutral-100 text-neutral-700",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
} as const;

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <div
      className={`mb-4 rounded-md border px-4 py-3 text-sm ${
        error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"
      }`}
      role="status"
    >
      {error ?? ok}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "border-b border-neutral-200 bg-neutral-50 px-4 py-3 font-medium text-neutral-600";
export const td = "border-b border-neutral-100 px-4 py-3 align-middle text-neutral-800";

export function Pagination({
  base,
  page,
  pages,
  params = {},
}: {
  base: string;
  page: number;
  pages: number;
  params?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    q.set("page", String(p));
    return `${base}?${q}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link className={btnGhostCls} href={href(page - 1)}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link className={btnGhostCls} href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

export const orderTone = {
  PENDING: "amber",
  CONFIRMED: "blue",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "green",
  CANCELLED: "red",
  REFUNDED: "gray",
} as const;

export const paymentTone = {
  UNPAID: "amber",
  AWAITING_VERIFICATION: "blue",
  PAID: "green",
  REFUNDED: "gray",
  FAILED: "red",
} as const;

/** Plain anchor on purpose: the response is a file download, not a page. */
export function ExportLink({ kind }: { kind: "orders" | "products" | "customers" | "subscribers" }) {
  return (
    <a href={`/admin/export/${kind}`} download className={btnGhostCls}>
      Export CSV
    </a>
  );
}
