"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

const BACK = "/admin/admins";
const Role = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "SUPPORT"]);

const Create = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(10, "Password must be at least 10 characters").max(128),
  role: Role,
});

export async function createAdmin(formData: FormData) {
  const me = await requireAdmin("admins:manage");
  const r = Create.safeParse(Object.fromEntries(formData));
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: r.data.email,
    password: r.data.password,
    email_confirm: true,
  });
  if (error || !data.user) redirect(withMessage(BACK, "error", error?.message ?? "Could not create user"));

  await prisma.adminUser.create({
    data: { id: data.user.id, email: r.data.email, name: r.data.name, role: r.data.role },
  });
  await audit(me, { action: "create", entity: "AdminUser", entityId: data.user.id, summary: `Added admin ${r.data.email} (${r.data.role})` });
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Admin created"));
}

export async function updateAdmin(id: string, formData: FormData) {
  const me = await requireAdmin("admins:manage");
  const role = Role.safeParse(formData.get("role"));
  if (!role.success) redirect(withMessage(BACK, "error", "Invalid role"));
  const isActive = formData.get("isActive") === "on";
  const password = String(formData.get("password") ?? "");

  const target = await prisma.adminUser.findUniqueOrThrow({ where: { id } });
  const losesSuper = target.role === "SUPER_ADMIN" && (role.data !== "SUPER_ADMIN" || !isActive);
  if (losesSuper) {
    const supers = await prisma.adminUser.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (supers <= 1) redirect(withMessage(BACK, "error", "There must be at least one active super admin"));
  }
  if (id === me.id && !isActive) redirect(withMessage(BACK, "error", "You cannot deactivate yourself"));

  if (password) {
    if (password.length < 10) redirect(withMessage(BACK, "error", "Password must be at least 10 characters"));
    const { error } = await createAdminClient().auth.admin.updateUserById(id, { password });
    if (error) redirect(withMessage(BACK, "error", error.message));
  }

  await prisma.adminUser.update({ where: { id }, data: { role: role.data, isActive } });
  await audit(me, {
    action: "update",
    entity: "AdminUser",
    entityId: id,
    summary: `Updated ${target.email}: role ${role.data}, ${isActive ? "active" : "disabled"}${password ? ", password reset" : ""}`,
  });
  revalidatePath(BACK);
  redirect(withMessage(BACK, "ok", "Admin updated"));
}
