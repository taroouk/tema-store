"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search as SearchIcon, Clock } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { allProducts } from "@/constants/all-products";
import { cn } from "@/lib/utils";

const RECENT_KEY = "tema:recent-searches";
const MAX_RECENT = 6;

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem(RECENT_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!open) return;

    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return [];

    return allProducts.filter((product) => {
      const category = product.category.toLowerCase();
      const name = product.name.toLowerCase();
      const colors = product.colors
        .map((color) => color.name.toLowerCase())
        .join(" ");

      return (
        name.includes(q) ||
        category.includes(q) ||
        colors.includes(q)
      );
    });
  }, [query]);

  const saveRecent = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(
        0,
        MAX_RECENT
      );

      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));

      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveRecent(query);
  };

  const clearRecent = () => {
    window.localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] transition-all duration-300",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
    >
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        tabIndex={open ? 0 : -1}
      />

      {/* Panel */}

      <div
        className={cn(
          "absolute inset-x-0 top-0 max-h-[90vh] overflow-y-auto bg-white transition-all duration-300",
          open ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8 xl:px-12">
          <div className="flex items-center justify-between py-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Search
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition hover:border-black"
              tabIndex={open ? 0 : -1}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="pb-6">
            <div className="flex items-center gap-4 border-b border-neutral-200 pb-4">
              <SearchIcon size={22} className="text-neutral-400" />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, categories, colors..."
                className="w-full bg-transparent text-lg outline-none placeholder:text-neutral-400 md:text-2xl"
                tabIndex={open ? 0 : -1}
                aria-label="Search query"
              />
            </div>
          </form>

          {/* Content */}

          <div className="pb-16">
            {query.trim() === "" ? (
              recent.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      <Clock size={16} /> Recent Searches
                    </h2>

                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-xs uppercase tracking-[0.18em] text-neutral-400 transition hover:text-black"
                      tabIndex={open ? 0 : -1}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-neutral-200 px-4 py-2 text-sm transition hover:border-black"
                        tabIndex={open ? 0 : -1}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-16 text-center text-neutral-400">
                  Start typing to search our collection.
                </p>
              )
            ) : results.length > 0 ? (
              <div>
                <p className="mb-6 text-sm text-neutral-500">
                  {results.length} result{results.length === 1 ? "" : "s"} for
                  &nbsp;&ldquo;{query}&rdquo;
                </p>

                <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg font-medium">No results found</p>

                <p className="mt-2 text-neutral-500">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
