import Link from "next/link";
import { X } from "lucide-react";

import { hasActiveFilters, type ShopQuery } from "@/lib/catalog/filter";

function href(basePath: string, q: ShopQuery, drop?: { key: "size" | "min" | "max"; value?: string }) {
  const p = new URLSearchParams();
  if (q.sort !== "featured") p.set("sort", q.sort);
  const sizes = drop?.key === "size" ? q.sizes.filter((s) => s !== drop.value) : q.sizes;
  if (sizes.length) p.set("size", sizes.join(","));
  if (q.min !== undefined && drop?.key !== "min") p.set("min", String(q.min));
  if (q.max !== undefined && drop?.key !== "max") p.set("max", String(q.max));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function ActiveFilters({ basePath, query }: { basePath: string; query: ShopQuery }) {
  if (!hasActiveFilters(query)) return null;

  const chips: { label: string; to: string }[] = [
    ...query.sizes.map((s) => ({ label: `Size: ${s}`, to: href(basePath, query, { key: "size", value: s }) })),
    ...(query.min !== undefined ? [{ label: `From EGP ${query.min}`, to: href(basePath, query, { key: "min" }) }] : []),
    ...(query.max !== undefined ? [{ label: `Up to EGP ${query.max}`, to: href(basePath, query, { key: "max" }) }] : []),
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <Link key={c.label} href={c.to} scroll={false} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium hover:bg-neutral-200">
          {c.label}
          <X size={12} aria-label="Remove filter" />
        </Link>
      ))}
      <Link href={basePath} scroll={false} className="ml-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 hover:text-foreground">
        Clear all
      </Link>
    </div>
  );
}
