"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function deleteSubscriber(id: string) {
  const admin = await requireAdmin("marketing:manage");
  const s = await prisma.subscriber.delete({ where: { id } });
  await audit(admin, { action: "delete", entity: "Subscriber", entityId: id, summary: `Deleted subscriber ${s.email}` });
  revalidatePath("/admin/subscribers");
  redirect(withMessage("/admin/subscribers", "ok", "Subscriber deleted"));
}
