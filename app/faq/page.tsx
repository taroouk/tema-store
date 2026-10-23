import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { FaqAccordion, type FaqItem } from "@/components/common/faq-accordion";
import { siteConfig } from "@/constants/site";
import { JsonLd } from "@/components/seo/json-ld";
import { getFaqItems } from "@/lib/content";
import { applyPlaceholders } from "@/lib/content/placeholders";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about Tema Label shipping, returns, orders, sizing, payments, and product care.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Tema Label",
    description: "Shipping, returns, orders, sizing, payments, and product care.",
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

export default async function FaqPage() {
  const [items, settings] = await Promise.all([getFaqItems(), getSettings()]);
  const faqs: FaqItem[] = items.map((i) => ({
    question: applyPlaceholders(i.question, settings),
    answer: applyPlaceholders(i.answer, settings),
  }));

  return (
    <Section className="py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Support
            </span>

            <h1
              className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Frequently Asked Questions
            </h1>
          </div>

          <FaqAccordion items={faqs} className="mt-16" />
        </div>
      </Container>
    </Section>
  );
}
