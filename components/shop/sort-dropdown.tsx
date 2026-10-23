"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { SORTS } from "@/lib/catalog/filter";

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-3 text-sm text-neutral-600">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={params.get("sort") ?? "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          next.delete("page");
          startTransition(() => router.push(`${pathname}?${next}`, { scroll: false }));
        }}
        className="h-11 rounded-full border border-neutral-300 bg-surface px-4 text-sm outline-none focus:border-foreground"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
