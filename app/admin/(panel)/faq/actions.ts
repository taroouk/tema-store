"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { CONTENT_TAG } from "@/lib/content";
import { prisma } from "@/lib/prisma/client";

const BACK = "/admin/faq";
const Input = z.object({
  question: z.string().trim().min(3, "Write the question").max(200),
  answer: z.string().trim().min(3, "Write the answer").max(3000),
  position: z.coerce.number().int().min(0).max(10_000),
});

function parse(formData: FormData) {
  const r = Input.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    position: formData.get("position") || 0,
  });
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));
  return { ...r.data, isActive: formData.get("isActive") === "on" };
}

function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath("/faq");
}

export async function createFaq(formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const data = parse(formData);
  const last = await prisma.faqItem.aggregate({ _max: { position: true } });
  const item = await prisma.faqItem.create({ data: { ...data, position: data.position || (last._max.position ?? 0) + 1 } });
  await audit(admin, { action: "create", entity: "FAQ", entityId: item.id, summary: `Added FAQ "${item.question}"` });
  publish();
  redirect(withMessage(BACK, "ok", "Question added"));
}

export async function updateFaq(id: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  const data = parse(formData);
  await prisma.faqItem.update({ where: { id }, data });
  await audit(admin, { action: "update", entity: "FAQ", entityId: id, summary: `Edited FAQ "${data.question}"` });
  publish();
  redirect(withMessage(BACK, "ok", "Question saved"));
}

export async function deleteFaq(id: string) {
  const admin = await requireAdmin("catalog:write");
  const item = await prisma.faqItem.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "FAQ", entityId: id, summary: `Deleted FAQ "${item.question}"` });
  publish();
  redirect(withMessage(BACK, "ok", "Question deleted"));
}
