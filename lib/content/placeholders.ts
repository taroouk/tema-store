import type { StoreSettingsDTO } from "@/lib/settings";

const egp = (n: number) => `EGP ${n.toLocaleString("en-US")}`;

/** Replaces {{tokens}} in editable content with live store settings. Unknown tokens are left as-is. */
export function applyPlaceholders(text: string, s: StoreSettingsDTO) {
  const values: Record<string, string> = {
    storeName: s.storeName,
    standardFee: egp(s.standardShippingFee),
    expressFee: egp(s.expressShippingFee),
    freeThreshold: egp(s.freeShippingThreshold),
    supportEmail: s.supportEmail || "our contact page",
    supportPhone: s.supportPhone || "",
  };
  return text.replace(/\{\{(\w+)\}\}/g, (m, key: string) => (key in values ? values[key] : m));
}

export const PLACEHOLDER_HELP = ["storeName", "standardFee", "expressFee", "freeThreshold", "supportEmail", "supportPhone"];
