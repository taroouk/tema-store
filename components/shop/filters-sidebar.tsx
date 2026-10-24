"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { Facets } from "@/lib/catalog/filter";

/** URL-driven filters: every change rewrites the query string so pages stay shareable. */
export function FiltersSidebar({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const push = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const toggle = (key: string, value: string) =>
    push((p) => {
      const cur = selected(key);
      const next = cur.some((v) => v.toLowerCase() === value.toLowerCase())
        ? cur.filter((v) => v.toLowerCase() !== value.toLowerCase())
        : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });

  const sizes = selected("size").map((s) => s.toLowerCase());
  const colors = selected("color").map((c) => c.toLowerCase());

  return (
    <div className={`space-y-10 ${pending ? "opacity-60" : ""}`} aria-busy={pending}>
      {facets.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">Size</legend>
          <div className="flex flex-wrap gap-3">
            {facets.sizes.map((size) => {
              const on = sizes.includes(size.toLowerCase());
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle("size", size)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm transition ${
                    on ? "border-foreground bg-foreground text-background" : "border-neutral-300 hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {facets.colors.length > 0 && (
        <fieldset>
          <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">Color</legend>
          <div className="flex flex-wrap gap-4">
            {facets.colors.map((c) => {
              const on = colors.includes(c.name.toLowerCase());
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={on}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => toggle("color", c.name)}
                  className={`h-8 w-8 rounded-full border transition ${
                    on ? "ring-2 ring-foreground ring-offset-2" : "border-neutral-300 hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              );
            })}
          </div>
        </fieldset>
      )}

      {facets.priceMax > facets.priceMin && (
        <fieldset>
          <legend className="mb-5 text-sm font-semibold uppercase tracking-[0.2em]">Price (EGP)</legend>
          <form
            key={params.get("min") + "-" + params.get("max")}
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              push((p) => {
                for (const k of ["min", "max"] as const) {
                  const v = String(data.get(k) ?? "").trim();
                  if (v) p.set(k, v);
                  else p.delete(k);
                }
              });
            }}
            className="flex items-center gap-2"
          >
            <input
              name="min"
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Minimum price"
              placeholder={String(facets.priceMin)}
              defaultValue={params.get("min") ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-foreground"
            />
            <span className="text-neutral-500">–</span>
            <input
              name="max"
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Maximum price"
              placeholder={String(facets.priceMax)}
              defaultValue={params.get("max") ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 px-3 text-sm outline-none focus:border-foreground"
            />
            <button className="h-11 rounded-xl bg-foreground px-4 text-sm font-medium text-background hover:bg-neutral-800">Go</button>
          </form>
        </fieldset>
      )}
    </div>
  );
}
