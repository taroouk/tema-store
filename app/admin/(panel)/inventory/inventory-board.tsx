"use client";

import { Check, Loader2, Minus, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { setVariantStock } from "./actions";

export interface InvVariant {
  id: string;
  size: string;
  sku: string;
  stock: number;
  lowStockAt: number;
  closed: boolean;
}
export interface InvProduct {
  id: string;
  name: string;
  image: string | null;
  category: string;
  published: boolean;
  variants: InvVariant[];
}

type Filter = "all" | "low" | "out";

const level = (stock: number, low: number) => (stock === 0 ? "out" : stock <= low ? "low" : "ok");

const TONE = {
  out: "border-red-300 bg-red-50 text-red-800",
  low: "border-amber-300 bg-amber-50 text-amber-900",
  ok: "border-neutral-300 bg-white text-neutral-900",
} as const;

function StockCell({
  variant,
  value,
  onSave,
}: {
  variant: InvVariant;
  value: number;
  onSave: (id: string, n: number) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(String(value));
  const [seen, setSeen] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // A rolled-back save changes `value` from outside: show it.
  if (seen !== value) {
    setSeen(value);
    setDraft(String(value));
  }

  const commit = async (raw: string) => {
    clearTimeout(timer.current);
    const n = Number(raw);
    if (raw.trim() === "" || !Number.isInteger(n) || n < 0 || n > 1_000_000) {
      setDraft(String(value));
      return;
    }
    if (n === value) return;
    setState("saving");
    const ok = await onSave(variant.id, n);
    setState(ok ? "saved" : "idle");
    if (ok) setTimeout(() => setState("idle"), 1200);
  };

  const step = (delta: number) => {
    const n = Math.max(0, (Number(draft) || 0) + delta);
    setDraft(String(n));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(String(n)), 600);
  };

  const tone = TONE[level(value, variant.lowStockAt)];

  return (
    <div className={`rounded-md border p-2 ${tone}`}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
        <span>{variant.size}</span>
        <span className="flex items-center gap-1">
          {variant.closed && (
            <span className="rounded bg-red-100 px-1 text-[10px] font-medium text-red-700" title="Closed in Daily sizes">
              ✕ closed
            </span>
          )}
          {state === "saving" && <Loader2 size={12} className="animate-spin" aria-label="Saving" />}
          {state === "saved" && <Check size={12} className="text-green-600" aria-label="Saved" />}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={Number(draft) <= 0}
          aria-label={`Decrease ${variant.size}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={draft}
          aria-label={`Stock for size ${variant.size}`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setDraft(String(value));
          }}
          className="h-8 w-full min-w-0 rounded border border-neutral-300 bg-white text-center text-sm font-semibold tabular-nums text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Increase ${variant.size}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "red" | "amber" }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          tone === "red" && value > 0 ? "text-red-600" : tone === "amber" && value > 0 ? "text-amber-600" : "text-neutral-900"
        }`}
      >
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

export function InventoryBoard({ products }: { products: InvProduct[] }) {
  const [stocks, setStocks] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.flatMap((p) => p.variants.map((v) => [v.id, v.stock])))
  );
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const save = async (id: string, n: number) => {
    const prev = stocks[id];
    setStocks((s) => ({ ...s, [id]: n }));
    try {
      await setVariantStock(id, n);
      return true;
    } catch {
      setStocks((s) => ({ ...s, [id]: prev }));
      toast.error("Could not save the stock. Try again.");
      return false;
    }
  };

  const stats = useMemo(() => {
    let units = 0;
    let low = 0;
    let out = 0;
    for (const p of products)
      for (const v of p.variants) {
        const s = stocks[v.id];
        units += s;
        const l = level(s, v.lowStockAt);
        if (l === "out") out++;
        else if (l === "low") low++;
      }
    return { units, low, out };
  }, [products, stocks]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term) && !p.variants.some((v) => v.sku.toLowerCase().includes(term))) {
        return false;
      }
      if (filter === "all") return true;
      return p.variants.some((v) => {
        const l = level(stocks[v.id], v.lowStockAt);
        return filter === "out" ? l === "out" : l === "low" || l === "out";
      });
    });
  }, [products, stocks, q, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "low", label: "Low or out" },
    { id: "out", label: "Out of stock" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Units in stock" value={stats.units} />
        <Stat label="Products" value={products.length} />
        <Stat label="Low stock sizes" value={stats.low} tone="amber" />
        <Stat label="Out of stock sizes" value={stats.out} tone="red" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 md:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product or SKU"
            aria-label="Search inventory"
            className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <div className="flex rounded-md border border-neutral-300 bg-white p-0.5" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                filter === t.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-neutral-500">Changes save automatically</p>
      </div>

      <div className="space-y-3">
        {visible.map((p) => {
          const total = p.variants.reduce((n, v) => n + stocks[v.id], 0);
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
                  <p className="text-xs text-neutral-500">
                    {p.category}
                    {!p.published && " · Draft"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">{total}</p>
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">units</p>
                </div>
              </header>
              <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {p.variants.map((v) => (
                  <StockCell key={v.id} variant={v} value={stocks[v.id]} onSave={save} />
                ))}
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
