import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Returns",
  description:
    "TEMA exchange policy, refund process, and return conditions — simple and customer friendly.",
  alternates: { canonical: "/returns" },
  openGraph: {
    title: "Returns | TEMA",
    description: "Exchange policy, refund process, and return conditions.",
    url: `${siteConfig.url}/returns`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function ReturnsPage() {
  return (
    <Section className="py-16">
      <Container>
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Support
          </span>

          <h1
            className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Returns & Exchanges
          </h1>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            We want you to love your TEMA pieces. If something isn&apos;t right,
            we make returns and exchanges simple.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-3">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Exchange Policy
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              Exchanges are accepted within 14 days of delivery for a different
              size or color, subject to availability. Contact support to start
              an exchange.
            </p>
          </div>

          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Refund Process
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              Once we receive and inspect your return, refunds are issued to
              your original payment method within 5–7 business days. You will
              receive an email confirmation when processed.
            </p>
          </div>

          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Conditions
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-8 text-neutral-600">
              <li>Items must be unworn and unwashed.</li>
              <li>Original tags must be attached.</li>
              <li>Items must be in their original packaging.</li>
              <li>Final sale items are not eligible for return.</li>
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
