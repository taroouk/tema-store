import {
  BadgeCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
  MapPin,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Premium Cotton",
    description: "100% premium combed cotton for everyday comfort.",
  },
  {
    icon: MapPin,
    title: "Made in Egypt",
    description: "Designed and crafted by local artisans.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Shipped within 2–4 business days.",
  },
  {
    icon: RefreshCcw,
    title: "Easy Exchange",
    description: "14 days hassle-free returns and exchanges.",
  },
  {
    icon: ShieldCheck,
    title: "Premium Guarantee",
    description: "Quality you can wear with confidence.",
  },
];

export function WhyChooseUs() {
  return (
    <Section className="py-24">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Why TEMA
          </span>

          <h2
            className="text-4xl font-semibold tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 md:grid-cols-3 lg:grid-cols-5">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <div
                key={reason.title}
                className="flex flex-col items-center gap-4 bg-white p-8 text-center"
              >
                <Icon
                  size={30}
                  strokeWidth={1.7}
                  className="text-neutral-900"
                />

                <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">
                  {reason.title}
                </h3>

                <p className="text-sm leading-6 text-neutral-500">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
