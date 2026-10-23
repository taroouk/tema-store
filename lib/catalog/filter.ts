import type { Product } from "@/types/product";

export const PAGE_SIZE = 12;

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export interface ShopQuery {
  sort: SortValue;
  sizes: string[];
  colors: string[];
  min?: number;
  max?: number;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (first(v) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return first(v) !== undefined && first(v) !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseShopQuery(params: RawParams): ShopQuery {
  const sort = SORTS.find((s) => s.value === first(params.sort))?.value ?? "featured";
  const page = Math.max(1, Math.min(500, Math.floor(Number(first(params.page))) || 1));
  return { sort, sizes: list(params.size), colors: list(params.color), min: num(params.min), max: num(params.max), page };
}

export interface Facets {
  sizes: string[];
  colors: { name: string; value: string }[];
  priceMin: number;
  priceMax: number;
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Facets are built from the unfiltered list so options never disappear while filtering. */
export function buildFacets(products: Product[]): Facets {
  const sizes = new Set<string>();
  const colors = new Map<string, { name: string; value: string }>();
  for (const p of products) {
    p.sizes.forEach((s) => sizes.add(s));
    p.colors.forEach((c) => colors.set(c.name.toLowerCase(), { name: c.name, value: c.value }));
  }
  const prices = products.map((p) => p.price);
  return {
    sizes: [...sizes].sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    }),
    colors: [...colors.values()],
    priceMin: prices.length ? Math.floor(Math.min(...prices)) : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
}

export function applyShopQuery(products: Product[], q: ShopQuery) {
  const sizes = q.sizes.map((s) => s.toLowerCase());
  const colors = q.colors.map((c) => c.toLowerCase());

  const filtered = products.filter((p) => {
    if (sizes.length && !p.sizes.some((s) => sizes.includes(s.toLowerCase()))) return false;
    if (colors.length && !p.colors.some((c) => colors.includes(c.name.toLowerCase()))) return false;
    if (q.min !== undefined && p.price < q.min) return false;
    if (q.max !== undefined && p.price > q.max) return false;
    return true;
  });

  const sorted = [...filtered];
  if (q.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (q.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (q.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  // "featured" and "newest" keep the catalog order (featured first, then newest).
  else if (q.sort === "featured") sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(q.page, pages);
  return { total: sorted.length, pages, page, items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

export function hasActiveFilters(q: ShopQuery) {
  return q.sizes.length > 0 || q.colors.length > 0 || q.min !== undefined || q.max !== undefined;
}
