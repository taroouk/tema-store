import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { FaqAccordion, type FaqItem } from "@/components/common/faq-accordion";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about TEMA shipping, returns, orders, sizing, payments, and product care.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | TEMA",
    description: "Shipping, returns, orders, sizing, payments, and product care.",
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

const faqs: FaqItem[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders are processed within 24 hours and delivered within 2–4 business days across Egypt. Express delivery is available at checkout.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order ships, you will receive a tracking link by email. You can follow your parcel until it arrives.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Returns and exchanges are accepted within 14 days, provided the item remains unworn and in its original condition with tags attached.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refunds are processed within 5–7 business days after we receive and inspect your return, to your original payment method.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Order changes are possible within 2 hours of placing the order. Contact support as soon as possible and we will do our best to help.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Each product page includes a Size Guide with measurements in centimeters. If you are between sizes, we recommend sizing up for a relaxed fit.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept credit and debit cards, as well as Cash On Delivery within Egypt.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. Checkout is processed over a secure connection and we never store your full card details.",
  },
  {
    question: "How should I care for my TEMA pieces?",
    answer:
      "Machine wash cold with like colors, tumble dry low, and iron on low heat. Avoid bleach to keep fabrics looking their best.",
  },
];

export default function FaqPage() {
  return (
    <Section className="py-16">
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
