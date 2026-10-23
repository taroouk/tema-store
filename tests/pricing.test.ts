import { describe, expect, it } from "vitest";

import { couponDiscount, DEFAULT_PRICING, getShippingMethods, shippingFee } from "@/lib/pricing";

describe("shippingFee", () => {
  it("charges the standard fee below the free-shipping threshold", () => {
    expect(shippingFee(1499, "standard", DEFAULT_PRICING)).toBe(80);
  });
  it("is free at or above the threshold for standard delivery", () => {
    expect(shippingFee(1500, "standard", DEFAULT_PRICING)).toBe(0);
  });
  it("never discounts express delivery", () => {
    expect(shippingFee(5000, "express", DEFAULT_PRICING)).toBe(150);
  });
  it("follows custom settings", () => {
    const s = { standardShippingFee: 50, expressShippingFee: 99, freeShippingThreshold: 500 };
    expect(shippingFee(499, "standard", s)).toBe(50);
    expect(shippingFee(500, "standard", s)).toBe(0);
    expect(getShippingMethods(s).map((m) => m.price)).toEqual([50, 99]);
  });
});

describe("couponDiscount", () => {
  it("applies a percentage and rounds", () => {
    expect(couponDiscount(598, { type: "PERCENT", value: 10 })).toBe(60);
  });
  it("applies a fixed amount", () => {
    expect(couponDiscount(598, { type: "FIXED", value: 100 })).toBe(100);
  });
  it("never exceeds the subtotal or goes negative", () => {
    expect(couponDiscount(50, { type: "FIXED", value: 100 })).toBe(50);
    expect(couponDiscount(0, { type: "PERCENT", value: 20 })).toBe(0);
  });
});

import { DEFAULT_PAYMENTS, enabledPaymentMethods } from "@/lib/pricing";

describe("enabledPaymentMethods", () => {
  it("offers only cash on delivery by default", () => {
    expect(enabledPaymentMethods(DEFAULT_PAYMENTS)).toEqual(["cod"]);
  });
  it("needs destination details before offering a transfer method", () => {
    const incomplete = { ...DEFAULT_PAYMENTS, instapay: { enabled: true, handle: "", accountName: "" } };
    expect(enabledPaymentMethods(incomplete)).toEqual(["cod"]);
    const ready = {
      ...DEFAULT_PAYMENTS,
      cod: false,
      instapay: { enabled: true, handle: "shop@instapay", accountName: "Shop" },
      wallet: { enabled: true, provider: "Vodafone Cash", number: "01000000000" },
    };
    expect(enabledPaymentMethods(ready)).toEqual(["instapay", "wallet"]);
  });
});
