import { describe, expect, it } from "vitest";

import { applyShopQuery, buildFacets, PAGE_SIZE, parseShopQuery } from "@/lib/catalog/filter";
import type { Product } from "@/types/product";

const make = (i: number, over: Partial<Product> = {}): Product => ({
  id: String(i),
  slug: `p-${i}`,
  name: `Product ${String.fromCharCode(65 + (i % 26))}${i}`,
  description: "",
  price: 100 + i * 10,
  category: "men",
  images: [],
  colors: [{ id: "black", name: "Black", value: "#000" }],
  sizes: ["S", "M"],
  stock: 5,
  ...over,
});

const products = [
  make(1, { sizes: ["S"], colors: [{ id: "red", name: "Red", value: "#f00" }] }),
  make(2, { sizes: ["M", "L"] }),
  make(3, { featured: true }),
  make(4, { price: 999 }),
];

describe("parseShopQuery", () => {
  it("falls back to safe defaults for junk input", () => {
    const q = parseShopQuery({ sort: "hack", page: "-5", min: "abc", size: ",,", color: undefined });
    expect(q).toEqual({ sort: "featured", sizes: [], colors: [], min: undefined, max: undefined, page: 1 });
  });
  it("parses lists and numbers", () => {
    const q = parseShopQuery({ sort: "price-asc", size: "S,M", color: "Red", min: "50", max: "500", page: "2" });
    expect(q).toMatchObject({ sort: "price-asc", sizes: ["S", "M"], colors: ["Red"], min: 50, max: 500, page: 2 });
  });
});

describe("applyShopQuery", () => {
  const base = parseShopQuery({});
  it("filters by size (case-insensitive)", () => {
    expect(applyShopQuery(products, { ...base, sizes: ["l"] }).items.map((p) => p.id)).toEqual(["2"]);
  });
  it("filters by color and price range", () => {
    expect(applyShopQuery(products, { ...base, colors: ["red"] }).items.map((p) => p.id)).toEqual(["1"]);
    expect(applyShopQuery(products, { ...base, min: 120, max: 200 }).items.map((p) => p.id)).toEqual(["3", "2"]);
  });
  it("sorts by price", () => {
    expect(applyShopQuery(products, { ...base, sort: "price-desc" }).items[0].id).toBe("4");
    expect(applyShopQuery(products, { ...base, sort: "price-asc" }).items[0].id).toBe("1");
  });
  it("puts featured items first by default", () => {
    expect(applyShopQuery(products, base).items[0].id).toBe("3");
  });
  it("paginates and clamps the page", () => {
    const many = Array.from({ length: PAGE_SIZE + 3 }, (_, i) => make(i + 1));
    const r = applyShopQuery(many, { ...base, page: 99 });
    expect(r.pages).toBe(2);
    expect(r.page).toBe(2);
    expect(r.items).toHaveLength(3);
  });
});

describe("buildFacets", () => {
  it("collects sizes, colors and the price range", () => {
    const f = buildFacets(products);
    expect(f.sizes).toEqual(["S", "M", "L"]);
    expect(f.colors.map((c) => c.name).sort()).toEqual(["Black", "Red"]);
    expect([f.priceMin, f.priceMax]).toEqual([110, 999]);
  });
});
