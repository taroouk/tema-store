"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { audit } from "@/lib/admin/audit";
import { withMessage } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/session";
import { CONTENT_TAG, PAGE_SLUGS } from "@/lib/content";
import { DEFAULT_PAGES } from "@/lib/content/defaults";
import { prisma } from "@/lib/prisma/client";

const Input = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300),
  body: z.string().trim().min(10, "The page text is too short").max(40_000),
});

function slugOrThrow(slug: string) {
  if (!PAGE_SLUGS.includes(slug)) throw new Error("Unknown page");
  return slug;
}

export async function savePage(slug: string, formData: FormData) {
  const admin = await requireAdmin("catalog:write");
  slugOrThrow(slug);
  const back = `/admin/pages/${slug}`;
  const r = Input.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    body: formData.get("body"),
  });
  if (!r.success) redirect(withMessage(back, "error", r.error.issues[0].message));

  await prisma.contentPage.upsert({ where: { slug }, update: r.data, create: { slug, ...r.data } });
  await audit(admin, { action: "update", entity: "Page", summary: `Edited page "${r.data.title}" (/${slug})` });

  updateTag(CONTENT_TAG);
  revalidatePath(`/${slug}`);
  redirect(withMessage(back, "ok", "Page saved and live"));
}

export async function resetPage(slug: string) {
  const admin = await requireAdmin("catalog:write");
  slugOrThrow(slug);
  const def = DEFAULT_PAGES.find((p) => p.slug === slug)!;
  await prisma.contentPage.upsert({
    where: { slug },
    update: { title: def.title, description: def.description, body: def.body },
    create: def,
  });
  await audit(admin, { action: "update", entity: "Page", summary: `Reset page "${def.title}" to the default text` });
  updateTag(CONTENT_TAG);
  revalidatePath(`/${slug}`);
  redirect(withMessage(`/admin/pages/${slug}`, "ok", "Restored the default text"));
}
