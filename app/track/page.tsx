import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { TrackForm } from "@/components/forms/track-form";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Tema Label order.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: true },
};

export default function TrackPage() {
  return (
    <Container>
      <section className="py-16">
        <div className="mb-12 max-w-2xl">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Orders</span>
          <h1 className="text-5xl" style={{ fontFamily: "var(--font-heading)" }}>Track your order</h1>
          <p className="mt-4 leading-8 text-neutral-600">
            Enter the order number from your confirmation and the email you used at checkout.
          </p>
        </div>
        <TrackForm />
      </section>
    </Container>
  );
}
