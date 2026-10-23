"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { SETTINGS_TAG } from "@/lib/settings";

const fee = z.coerce.number().min(0).max(100_000);
// Social profile links: empty, or a real https URL (never javascript: etc.).
const url = z.string().trim().max(200).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Links must start with https://");
const Input = z.object({
  storeName: z.string().trim().min(1).max(60),
  supportEmail: z.string().trim().email().or(z.literal("")),
  supportPhone: z.string().trim().max(30),
  announcement: z.string().trim().max(160),
  storeHours: z.string().trim().max(300),
  unpaidHoldHours: z.coerce.number().int().min(1).max(720),
  commercialRegister: z.string().trim().max(60),
  taxCardNumber: z.string().trim().max(60),
  businessAddress: z.string().trim().max(250),
  instagramUrl: url,
  facebookUrl: url,
  tiktokUrl: url,
  xUrl: url,
  pinterestUrl: url,
  googleVerification: z.string().trim().max(120).regex(/^[\w-]*$/, "Use only the code from Google, not the full tag"),
  bingVerification: z.string().trim().max(120).regex(/^[\w-]*$/, "Use only the code from Bing, not the full tag"),
  standardShippingFee: fee,
  expressShippingFee: fee,
  freeShippingThreshold: fee,
  codEnabled: z.boolean(),
  instapayEnabled: z.boolean(),
  instapayHandle: z.string().trim().max(80),
  instapayAccountName: z.string().trim().max(80),
  walletEnabled: z.boolean(),
  walletProvider: z.string().trim().max(40),
  walletNumber: z.string().trim().max(30),
  paymentInstructions: z.string().trim().max(500),
});

export async function saveSettings(formData: FormData) {
  const admin = await requireAdmin("settings:manage");
  const raw = Object.fromEntries(formData);
  const r = Input.safeParse({
    ...raw,
    codEnabled: formData.get("codEnabled") === "on",
    instapayEnabled: formData.get("instapayEnabled") === "on",
    walletEnabled: formData.get("walletEnabled") === "on",
  });
  if (!r.success) redirect(withMessage("/admin/settings", "error", `${r.error.issues[0].path.join(".")}: ${r.error.issues[0].message}`));

  if (r.data.instapayEnabled && !r.data.instapayHandle) {
    redirect(withMessage("/admin/settings", "error", "Add your InstaPay address (IPA) before enabling InstaPay"));
  }
  if (r.data.walletEnabled && !r.data.walletNumber) {
    redirect(withMessage("/admin/settings", "error", "Add your wallet number before enabling wallet payments"));
  }
  if (!r.data.codEnabled && !r.data.instapayEnabled && !r.data.walletEnabled) {
    redirect(withMessage("/admin/settings", "error", "Keep at least one payment method enabled"));
  }

  const data = {
    ...r.data,
    instapayHandle: r.data.instapayHandle || null,
    instapayAccountName: r.data.instapayAccountName || null,
    walletProvider: r.data.walletProvider || null,
    walletNumber: r.data.walletNumber || null,
    paymentInstructions: r.data.paymentInstructions || null,
    supportEmail: r.data.supportEmail || null,
    supportPhone: r.data.supportPhone || null,
    announcement: r.data.announcement || null,
    storeHours: r.data.storeHours || null,
    commercialRegister: r.data.commercialRegister || null,
    taxCardNumber: r.data.taxCardNumber || null,
    businessAddress: r.data.businessAddress || null,
    instagramUrl: r.data.instagramUrl || null,
    facebookUrl: r.data.facebookUrl || null,
    tiktokUrl: r.data.tiktokUrl || null,
    xUrl: r.data.xUrl || null,
    pinterestUrl: r.data.pinterestUrl || null,
    googleVerification: r.data.googleVerification || null,
    bingVerification: r.data.bingVerification || null,
  };
  await prisma.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await audit(admin, { action: "update", entity: "Settings", summary: "Updated store settings" });

  updateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  redirect(withMessage("/admin/settings", "ok", "Settings saved"));
}
