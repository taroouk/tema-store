"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

const BACK = "/admin/coupons";
const opt = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());

const Input = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Code: 3–30 letters, numbers, - or _"),
    description: z.string().trim().max(200).optional(),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive("Value must be greater than 0").max(1_000_000),
    minSubtotal: opt(z.coerce.number().min(0)),
    maxUses: opt(z.coerce.number().int().min(1)),
    startsAt: opt(z.coerce.date()),
    endsAt: opt(z.coerce.date()),
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, { message: "A percentage can't exceed 100", path: ["value"] })
  .refine((d) => !d.startsAt || !d.endsAt || d.endsAt > d.startsAt, { message: "End date must be after the start date", path: ["endsAt"] });

function parse(formData: FormData) {
  const r = Input.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    value: formData.get("value"),
    minSubtotal: formData.get("minSubtotal"),
    maxUses: formData.get("maxUses"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));
  return { ...r.data, isActive: formData.get("isActive") === "on" };
}

export async function createCoupon(formData: FormData) {
  const admin = await requireAdmin("marketing:manage");
  const data = parse(formData);
  try {
    const c = await prisma.coupon.create({ data });
    await audit(admin, { action: "create", entity: "Coupon", entityId: c.id, summary: `Created coupon ${c.code}` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "That coupon code already exists"));
    }
    throw e;
  }
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Coupon created"));
}

export async function updateCoupon(id: string, formData: FormData) {
  const admin = await requireAdmin("marketing:manage");
  const data = parse(formData);
  try {
    await prisma.coupon.update({
      where: { id },
      data: { ...data, description: data.description ?? null, minSubtotal: data.minSubtotal ?? null, maxUses: data.maxUses ?? null, startsAt: data.startsAt ?? null, endsAt: data.endsAt ?? null },
    });
    await audit(admin, { action: "update", entity: "Coupon", entityId: id, summary: `Updated coupon ${data.code}` });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect(withMessage(BACK, "error", "That coupon code already exists"));
    }
    throw e;
  }
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Coupon saved"));
}

export async function deleteCoupon(id: string) {
  const admin = await requireAdmin("marketing:manage");
  const c = await prisma.coupon.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "Coupon", entityId: id, summary: `Deleted coupon ${c.code}` });
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Coupon deleted"));
}
