import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Markdown } from "@/components/content/markdown";
import { siteConfig } from "@/constants/site";
import { getContentPage } from "@/lib/content";
import { applyPlaceholders } from "@/lib/content/placeholders";
import { getSettings } from "@/lib/settings";

export async function legalMetadata(slug: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getContentPage(slug), getSettings()]);
  if (!page) return {};
  const description = applyPlaceholders(page.description, settings);
  return {
    title: page.title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${page.title} | ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}/${slug}`,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: siteConfig.ogImage }],
    },
  };
}

/** Policy page whose text is edited in Admin → Content. */
export async function LegalPage({ slug, eyebrow = "Legal" }: { slug: string; eyebrow?: string }) {
  const [page, settings] = await Promise.all([getContentPage(slug), getSettings()]);
  if (!page) notFound();

  const body = applyPlaceholders(page.body, settings);
  // The first paragraph becomes the intro line under the title.
  const [intro, ...rest] = body.split(/\n{2,}/);
  const hasIntro = intro && !intro.startsWith("#") && !intro.startsWith("|") && !intro.startsWith("-");

  return (
    <Section className="py-16">
      <Container>
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{eyebrow}</span>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-heading)" }}>
            {page.title}
          </h1>
          {hasIntro && <p className="mt-6 text-lg leading-8 text-neutral-600">{intro}</p>}
        </div>
        <div className="mt-12 max-w-3xl">
          <Markdown>{hasIntro ? rest.join("\n\n") : body}</Markdown>
        </div>
      </Container>
    </Section>
  );
}
