import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma/client";

import { DEFAULT_FAQ, DEFAULT_PAGES, type DefaultPage } from "./defaults";

export const CONTENT_TAG = "content";

export const PAGE_SLUGS = DEFAULT_PAGES.map((p) => p.slug);

export const getContentPage = unstable_cache(
  async (slug: string): Promise<DefaultPage | null> => {
    const fallback = DEFAULT_PAGES.find((p) => p.slug === slug);
    if (!fallback) return null;
    const row = await prisma.contentPage.findUnique({ where: { slug } });
    return row ? { slug, title: row.title, description: row.description, body: row.body } : fallback;
  },
  ["content-page"],
  { tags: [CONTENT_TAG], revalidate: 300 }
);

export const getFaqItems = unstable_cache(
  async () => {
    const total = await prisma.faqItem.count();
    // Never show an empty FAQ before the content has been seeded.
    if (total === 0) return DEFAULT_FAQ.map((f, i) => ({ id: String(i), ...f }));
    const rows = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => ({ id: r.id, question: r.question, answer: r.answer }));
  },
  ["content-faq"],
  { tags: [CONTENT_TAG], revalidate: 300 }
);
