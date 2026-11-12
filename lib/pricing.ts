/** Pricing rules shared by the checkout UI and the server (the server is the source of truth). */
export interface PricingSettings {
  standardShippingFee: number;
  freeShippingThreshold: number;
  bundle?: BundleOffer;
}

/** "Buy 2 save X%, buy 3+ save Y%" — editable in Admin → Settings. */
export interface BundleOffer {
  enabled: boolean;
  percent2: number;
  percent3: number;
  textEn: string;
  textAr: string;
}

export const DEFAULT_BUNDLE: BundleOffer = { enabled: true, percent2: 5, percent3: 10, textEn: "", textAr: "" };

/** Percent off for a cart with `count` pieces (0 when the offer is off or not reached). */
export function bundlePercent(count: number, offer: BundleOffer | undefined): number {
  if (!offer || !offer.enabled) return 0;
  if (count >= 3) return offer.percent3;
  if (count === 2) return offer.percent2;
  return 0;
}

export function bundleDiscount(subtotal: number, count: number, offer: BundleOffer | undefined) {
  return Math.round((subtotal * bundlePercent(count, offer)) / 100);
}

/** Offer lines shown to shoppers: admin's custom text if set, otherwise generated from the percentages. */
export function bundleLines(offer: BundleOffer | undefined): { en: string[]; ar: string[] } {
  if (!offer || !offer.enabled || (offer.percent2 <= 0 && offer.percent3 <= 0)) return { en: [], ar: [] };
  const custom = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
  const en = custom(offer.textEn);
  const ar = custom(offer.textAr);
  return {
    en: en.length ? en : [
      ...(offer.percent2 > 0 ? [`🎁 ${offer.percent2}% off when you buy 2 pieces.`] : []),
      ...(offer.percent3 > 0 ? [`🎁 ${offer.percent3}% off when you buy 3 pieces.`] : []),
    ],
    ar: ar.length ? ar : [
      ...(offer.percent2 > 0 ? [`🎁 خصم ${offer.percent2}% عند شراء قطعتين.`] : []),
      ...(offer.percent3 > 0 ? [`🎁 خصم ${offer.percent3}% عند شراء 3 قطع.`] : []),
    ],
  };
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
