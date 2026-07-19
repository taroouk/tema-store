import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "TEMA Terms & Conditions covering orders, payments, intellectual property, and liability.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms & Conditions | TEMA",
    description: "Orders, payments, intellectual property, and liability.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            By using this website and placing an order, you agree to the terms
            below.
          </p>
        </div>

        <div className="mt-16 max-w-3xl space-y-12">
          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Orders
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              Orders placed through {siteConfig.name} are an offer to purchase.
              We reserve the right to refuse or cancel any order, including
              after an order confirmation has been sent.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Payments
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              Prices are listed in EGP and are inclusive of standard taxes.
              Payment is processed securely at checkout. Ownership passes once
              payment is received in full.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Intellectual Property
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              All content, including logos, photography, and designs, is the
              property of {siteConfig.name} or its licensors and may not be
              reproduced without written permission.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Liability
            </h2>
            <p className="mt-4 leading-8 text-neutral-600">
              To the maximum extent permitted by law, {siteConfig.name} is not
              liable for indirect or consequential damages arising from the use
              of this website or its products.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
