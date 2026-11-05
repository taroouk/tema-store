import "server-only";

import { unstable_cache } from "next/cache";

import { DEFAULT_PAYMENTS, DEFAULT_PRICING, type PaymentConfig, type PricingSettings } from "@/lib/pricing";
import { prisma } from "@/lib/prisma/client";

export const SETTINGS_TAG = "settings";

/** Turns a phone number (01012345678, +20 101 234 5678…) into a wa.me link; "" if invalid. */
export function whatsappLink(raw: string | null | undefined): string {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "20" + d.slice(1);
  return d.length >= 8 && d.length <= 15 ? `https://wa.me/${d}` : "";
}

export interface StoreSettingsDTO extends PricingSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  announcement: string;
  storeHours: string;
  googleVerification: string;
  bingVerification: string;
  payments: PaymentConfig;
  unpaidHoldHours: number;
  commercialRegister: string;
  taxCardNumber: string;
  businessAddress: string;
  links: { instagram: string; facebook: string; tiktok: string; x: string; pinterest: string; whatsapp: string };
}

export const getSettings = unstable_cache(
  async (): Promise<StoreSettingsDTO> => {
    const row = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    return {
      storeName: row?.storeName ?? "Tema Label",
      supportEmail: row?.supportEmail ?? "",
      supportPhone: row?.supportPhone ?? "",
      whatsappNumber: row?.whatsappNumber ?? "",
      announcement: row?.announcement ?? "",
      storeHours: row?.storeHours ?? "",
      unpaidHoldHours: row?.unpaidHoldHours ?? 48,
      commercialRegister: row?.commercialRegister ?? "",
      taxCardNumber: row?.taxCardNumber ?? "",
      businessAddress: row?.businessAddress ?? "",
      links: {
        instagram: row?.instagramUrl ?? "",
        facebook: row?.facebookUrl ?? "",
        tiktok: row?.tiktokUrl ?? "",
        x: row?.xUrl ?? "",
        pinterest: row?.pinterestUrl ?? "",
        whatsapp: whatsappLink(row?.whatsappNumber),
      },
      googleVerification: row?.googleVerification ?? "",
      bingVerification: row?.bingVerification ?? "",
      payments: row
        ? {
            cod: row.codEnabled,
            instapay: {
              enabled: row.instapayEnabled,
              handle: row.instapayHandle ?? "",
              accountName: row.instapayAccountName ?? "",
            },
            wallet: {
              enabled: row.walletEnabled,
              provider: row.walletProvider ?? "",
              number: row.walletNumber ?? "",
            },
            instructions: row.paymentInstructions ?? "",
          }
        : DEFAULT_PAYMENTS,
      standardShippingFee: row ? Number(row.standardShippingFee) : DEFAULT_PRICING.standardShippingFee,
      freeShippingThreshold: row ? Number(row.freeShippingThreshold) : DEFAULT_PRICING.freeShippingThreshold,
    };
  },
  ["store-settings"],
  { tags: [SETTINGS_TAG], revalidate: 300 }
);
