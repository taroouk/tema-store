"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCategories } from "@/components/catalog/catalog-provider";

const linkCls = "block whitespace-nowrap px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:bg-neutral-100";

/** "Shop" menu listing every category that has products. Opens on hover, click or keyboard. */
export function ShopDropdown() {
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (categories.length === 0) return null;

  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-neutral-500"
      >
        Shop
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <ul className="min-w-[200px] overflow-hidden rounded-xl border border-neutral-200 bg-surface py-2 shadow-xl">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} onClick={() => setOpen(false)} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-neutral-200 pt-1">
              <Link href="/new-in" onClick={() => setOpen(false)} className={linkCls}>
                New In
              </Link>
            </li>
          </ul>
        </div>
      )}
    </li>
  );
}
