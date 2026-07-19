import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TEMA collects, uses, and protects your data, including cookies and your customer rights.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | TEMA",
    description: "Data collection, cookies, and your customer rights.",
    url: `${siteConfig.url}/privacy`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function PrivacyPage() {
  return (
    <Section className="py-16">
      <Container>
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Legal
          </span>

          <h1
            className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Privacy Policy
          </h1>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            This policy explains how {siteConfig.name} collects, uses, and
            protects your personal information.
          </p>
        </div>

        <div className="mt-16 max-w-3xl space-y-12">
          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Data Collection
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              We collect information you provide directly — such as your name,
              email, shipping address, and order details — as well as limited
              technical data like device and browser type needed to operate the
              site securely.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Cookies
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              We use cookies to keep your cart, remember preferences, and
              understand how the site is used. You can disable cookies in your
              browser, though some features may not work as intended.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How We Use Your Data
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              Your information is used to process orders, provide support,
              prevent fraud, and improve our products. We do not sell your
              personal data to third parties.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your Rights
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              You may request access to, correction of, or deletion of your
              personal data at any time by contacting our support team. We will
              respond in accordance with applicable privacy law.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
