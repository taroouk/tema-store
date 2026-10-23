import { describe, expect, it } from "vitest";

import { getCartTotals } from "@/lib/cart-totals";
import { DEFAULT_PRICING } from "@/lib/pricing";
import type { Product } from "@/types/product";

const product = (id: string, price: number): Product => ({
  id,
  slug: id,
  name: id,
  description: "",
  price,
  category: "men",
  images: [{ id: "a", src: "/a.png", alt: "" }],
  colors: [{ id: "black", name: "Black", value: "#000" }],
  sizes: ["M"],
  stock: 9,
});

describe("getCartTotals", () => {
  const catalog = [product("a", 500), product("b", 700)];

  it("adds shipping below the threshold", () => {
    const t = getCartTotals([{ productId: "a", colorId: "black", size: "M", quantity: 2 }], catalog, DEFAULT_PRICING);
    expect(t).toMatchObject({ subtotal: 1000, shipping: 80, total: 1080, count: 2 });
  });
  it("ships free once the subtotal reaches the threshold", () => {
    const t = getCartTotals([{ productId: "b", colorId: "black", size: "M", quantity: 3 }], catalog, DEFAULT_PRICING);
    expect(t).toMatchObject({ subtotal: 2100, shipping: 0, total: 2100 });
  });
  it("ignores products that no longer exist", () => {
    const t = getCartTotals([{ productId: "gone", colorId: "x", size: "M", quantity: 1 }], catalog, DEFAULT_PRICING);
    expect(t).toMatchObject({ subtotal: 0, shipping: 0, total: 0, count: 0 });
  });
});
