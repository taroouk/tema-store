"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma/client";
import { verifyToken } from "@/lib/tokens";

export async function unsubscribe(formData: FormData): Promise<{ ok: boolean }> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("e"));
  if (!email.success || !verifyToken("unsubscribe", email.data, formData.get("t"))) return { ok: false };
  await prisma.subscriber.updateMany({ where: { email: email.data }, data: { isActive: false } });
  return { ok: true };
}
