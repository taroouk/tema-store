"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

const Credentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(formData: FormData) {
  const parsed = Credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?error=Invalid+email+or+password");

  // Slow down password guessing from one address (Supabase also rate-limits on its side).
  if (!(await rateLimit("admin-login", 8, 10 * 60_000))) redirect("/admin/login?error=Too+many+attempts.+Try+again+in+a+few+minutes");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  // Same message for every failure so accounts can't be enumerated.
  if (error || !data.user) redirect("/admin/login?error=Invalid+email+or+password");

  const admin = await prisma.adminUser.findUnique({ where: { id: data.user.id } });
  if (!admin || !admin.isActive) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Invalid+email+or+password");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
