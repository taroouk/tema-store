import {
  BadgeCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Timeless Design",
    description: "Minimal pieces made to be worn on repeat.",
  },
  {
    icon: Wallet,
    title: "Pay Your Way",
    description: "Cash on delivery, InstaPay or mobile wallet.",
  },
  {
    icon: Truck,
    title: "Delivery Across Egypt",
    description: "Delivered to your door in 2–4 business days.",
  },
  {
    icon: RefreshCcw,
    title: "Easy Exchange",
    description: "14 days to exchange a piece that isn't right.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description: "Encrypted checkout — we never ask for card details.",
  },
];

export function WhyChooseUs() {
  return (
    <Section className="py-24">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Why Tema Label
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
                className="flex flex-col items-center gap-4 bg-surface p-8 text-center"
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
