"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

const BACK = "/admin/profile";

export async function updateProfile(formData: FormData) {
  const me = await requireAdmin();
  const name = z.string().trim().min(1).max(100).safeParse(formData.get("name"));
  if (!name.success) redirect(withMessage(BACK, "error", "Enter your name"));
  await prisma.adminUser.update({ where: { id: me.id }, data: { name: name.data } });
  revalidatePath("/admin", "layout");
  redirect(withMessage(BACK, "ok", "Profile updated"));
}

const Password = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(10, "New password must be at least 10 characters").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords don't match", path: ["confirm"] })
  .refine((d) => d.next !== d.current, { message: "Choose a different password", path: ["next"] });

export async function changePassword(formData: FormData) {
  const me = await requireAdmin();
  const r = Password.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!r.success) redirect(withMessage(BACK, "error", r.error.issues[0].message));

  // Verify the current password with a throwaway client so the live session isn't touched.
  const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error: badPassword } = await verifier.auth.signInWithPassword({ email: me.email, password: r.data.current });
  if (badPassword) redirect(withMessage(BACK, "error", "Current password is incorrect"));

  const { error } = await createAdminClient().auth.admin.updateUserById(me.id, { password: r.data.next });
  if (error) redirect(withMessage(BACK, "error", error.message));

  await audit(me, { action: "update", entity: "AdminUser", entityId: me.id, summary: "Changed own password" });
  redirect(withMessage(BACK, "ok", "Password changed"));
}
