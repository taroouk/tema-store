import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

import { can, type Permission } from "./permissions";

/**
 * Resolves the signed-in admin. The Supabase user is verified server-side with
 * `getUser()` (never trust the cookie alone), then matched to an active AdminUser row.
 */
export const getAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const admin = await prisma.adminUser.findUnique({ where: { id: data.user.id } });
  if (!admin || !admin.isActive) return null;
  return admin;
});

/** Use at the top of every admin page and server action. */
export async function requireAdmin(permission?: Permission) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (permission && !can(admin.role, permission)) redirect("/admin?denied=1");
  return admin;
}
