"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { openAllSizes, setSizesClosed } from "./actions";

export interface DsProduct {
  id: string;
  name: string;
  image: string | null;
  category: string;
  sizes: { size: string; stock: number }[];
  closed: string[];
}

type Filter = "all" | "closed";

function Stat({ label, value, tone }: { label: string; value: number; tone?: "red" }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "red" && value > 0 ? "text-red-600" : ""}`}>{value}</p>
    </div>
  );
}

export function SizesBoard({ products }: { products: DsProduct[] }) {
  const [closed, setClosed] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(products.map((p) => [p.id, p.closed]))
  );
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, start] = useTransition();

  const apply = (productId: string, sizes: string[], value: boolean) => {
    const before = closed[productId] ?? [];
    const next = value ? [...new Set([...before, ...sizes])] : before.filter((s) => !sizes.includes(s));
    setClosed((c) => ({ ...c, [productId]: next }));
    start(async () => {
      try {
        await setSizesClosed(productId, sizes, value);
      } catch {
        setClosed((c) => ({ ...c, [productId]: before }));
        toast.error("Could not save. Try again.");
      }
    });
  };

  const reset = () => {
    if (!window.confirm("Open every closed size in the store?")) return;
    const before = closed;
    setClosed(Object.fromEntries(products.map((p) => [p.id, []])));
    start(async () => {
      try {
        await openAllSizes();
        toast.success("All sizes are open");
      } catch {
        setClosed(before);
        toast.error("Could not save. Try again.");
      }
    });
  };

  const stats = useMemo(() => {
    let sizes = 0;
    let withClosed = 0;
    let all = 0;
    for (const p of products) {
      const n = closed[p.id]?.length ?? 0;
      sizes += n;
      if (n) withClosed++;
      if (n && n === p.sizes.length) all++;
    }
    return { sizes, withClosed, all };
  }, [products, closed]);

  const visible = products.filter(
    (p) =>
      (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())) &&
      (filter === "all" || (closed[p.id]?.length ?? 0) > 0)
  );

  return (
    <div className="space-y-5" aria-busy={pending}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Products" value={products.length} />
        <Stat label="Closed sizes" value={stats.sizes} tone="red" />
        <Stat label="Products with a closed size" value={stats.withClosed} />
        <Stat label="Fully closed products" value={stats.all} tone="red" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 md:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product"
            aria-label="Search products"
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <div className="flex rounded-md border border-neutral-300 bg-white p-0.5" role="tablist">
          {(
            [
              ["all", "All"],
              ["closed", "Has closed sizes"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                filter === id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {stats.sizes > 0 && (
          <button
            onClick={reset}
            className="ml-auto rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            Open all sizes
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((p) => {
          const set = new Set(closed[p.id] ?? []);
          const open = p.sizes.length - set.size;
          const allSizes = p.sizes.map((s) => s.size);
          return (
            <section key={p.id} className="rounded-lg border border-neutral-200 bg-white">
              <header className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md bg-neutral-100 object-cover" />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-md bg-neutral-100" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${p.id}`} className="block truncate text-sm font-semibold hover:underline">
                    {p.name}
                  </Link>
                  <p className="text-xs text-neutral-500">{p.category}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    open === 0 ? "bg-red-100 text-red-800" : set.size ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {open === 0 ? "All closed" : `${open} of ${p.sizes.length} open`}
                </span>
                <button
                  onClick={() => apply(p.id, allSizes, open > 0)}
                  className="text-xs text-neutral-500 underline hover:text-neutral-900"
                >
                  {open > 0 ? "Close all" : "Open all"}
                </button>
              </header>
              <div className="flex flex-wrap gap-2 p-3">
                {p.sizes.map((s) => {
                  const isClosed = set.has(s.size);
                  return (
                    <button
                      key={s.size}
                      type="button"
                      aria-pressed={!isClosed}
                      onClick={() => apply(p.id, [s.size], !isClosed)}
                      className={`min-w-[5rem] rounded-md border px-3 py-2 text-center transition ${
                        isClosed
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${isClosed ? "line-through" : ""}`}>
                        {s.size} {isClosed && <span aria-hidden>✕</span>}
                      </span>
                      <span className="block text-[11px] opacity-70">
                        {isClosed ? "Closed" : "Open"} · stock {s.stock}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        {visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
            No products match.
          </div>
        )}
      </div>
    </div>
  );
}
