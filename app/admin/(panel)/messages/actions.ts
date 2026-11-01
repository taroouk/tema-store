"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function setMessageStatus(id: string, status: "NEW" | "READ" | "ARCHIVED") {
  const admin = await requireAdmin("customers:view");
  const parsed = z.enum(["NEW", "READ", "ARCHIVED"]).parse(status);
  const m = await prisma.contactMessage.update({ where: { id }, data: { status: parsed } });
  await audit(admin, { action: "update", entity: "Message", entityId: id, summary: `Marked message from ${m.email ?? m.phone ?? m.name} as ${parsed.toLowerCase()}` });
  revalidatePath("/admin/messages");
  redirect(withMessage("/admin/messages", "ok", `Marked as ${parsed.toLowerCase()}`));
}

export async function deleteMessage(id: string) {
  const admin = await requireAdmin("customers:view");
  const m = await prisma.contactMessage.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "Message", entityId: id, summary: `Deleted message from ${m.email ?? m.phone ?? m.name}` });
  revalidatePath("/admin/messages");
  redirect(withMessage("/admin/messages", "ok", "Message deleted"));
}
