/** Pricing rules shared by the checkout UI and the server (the server is the source of truth). */
export interface PricingSettings {
  standardShippingFee: number;
  freeShippingThreshold: number;
}

export const DEFAULT_PRICING: PricingSettings = {
  standardShippingFee: 80,
  freeShippingThreshold: 1500,
};

export type ShippingMethodId = "standard";

/** Payment options the storefront may offer, as configured in Admin → Settings. */
export type PaymentMethodId = "cod" | "instapay" | "wallet";

export interface PaymentConfig {
  cod: boolean;
  instapay: { enabled: boolean; handle: string; accountName: string };
  wallet: { enabled: boolean; provider: string; number: string };
  instructions: string;
}

export const DEFAULT_PAYMENTS: PaymentConfig = {
  cod: true,
  instapay: { enabled: false, handle: "", accountName: "" },
  wallet: { enabled: false, provider: "", number: "" },
  instructions: "",
};

/** A transfer option is only offered once its destination details are filled in. */
export function enabledPaymentMethods(p: PaymentConfig): PaymentMethodId[] {
  const out: PaymentMethodId[] = [];
  if (p.cod) out.push("cod");
  if (p.instapay.enabled && p.instapay.handle) out.push("instapay");
  if (p.wallet.enabled && p.wallet.number) out.push("wallet");
  return out;
}

export function getShippingMethods(s: PricingSettings) {
  return [
    { id: "standard" as const, label: "Standard Delivery", detail: "2–4 business days", price: s.standardShippingFee },
  ];
}

export function shippingFee(subtotal: number, _method: ShippingMethodId, s: PricingSettings) {
  return subtotal >= s.freeShippingThreshold ? 0 : s.standardShippingFee;
}

export interface CouponTerms {
  type: "PERCENT" | "FIXED";
  value: number;
}

export function couponDiscount(subtotal: number, c: CouponTerms) {
  const raw = c.type === "PERCENT" ? (subtotal * c.value) / 100 : c.value;
  return Math.max(0, Math.min(Math.round(raw), subtotal));
}
