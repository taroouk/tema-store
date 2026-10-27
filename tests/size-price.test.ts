import { describe, expect, it } from "vitest";

import { isLargeSize, priceForSize, sortSizes } from "@/lib/size-price";

describe("size price tiers", () => {
  const p = { price: 500, priceLarge: 600 };

  it("S to 2XL share one price, 3XL to 5XL share the other", () => {
    for (const s of ["S", "M", "L", "XL", "2XL", "XXL"]) expect(priceForSize(p, s)).toBe(500);
    for (const s of ["3XL", "4XL", "5XL", "3xl", "XXXL"]) expect(priceForSize(p, s)).toBe(600);
  });

  it("falls back to the base price when no large price is set", () => {
    expect(priceForSize({ price: 500 }, "5XL")).toBe(500);
    expect(priceForSize({ price: 500, priceLarge: null }, "4XL")).toBe(500);
  });

  it("detects large sizes only", () => {
    expect(isLargeSize("XL")).toBe(false);
    expect(isLargeSize("2XL")).toBe(false);
    expect(isLargeSize("ONE SIZE")).toBe(false);
    expect(isLargeSize("3 XL")).toBe(true);
  });

  it("sorts S to 5XL", () => {
    expect(sortSizes(["5XL", "S", "3XL", "XL", "M", "2XL", "4XL", "L"])).toEqual(["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]);
  });
});
