"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function saveCustomerNotes(id: string, formData: FormData) {
  const admin = await requireAdmin("customers:view");
  const notes = z.string().max(2000).safeParse(formData.get("notes") ?? "");
  const back = `/admin/customers/${id}`;
  if (!notes.success) redirect(withMessage(back, "error", "Notes are too long"));

  const c = await prisma.customer.update({ where: { id }, data: { notes: notes.data || null } });
  await audit(admin, { action: "update", entity: "Customer", entityId: id, summary: `Updated notes for ${c.email}` });
  revalidatePath(back);
  redirect(withMessage(back, "ok", "Notes saved"));
}
