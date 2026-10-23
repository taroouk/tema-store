import { SubscribeForm } from "@/components/forms/subscribe-form";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function Newsletter() {
  return (
    <Section className="py-24">
      <Container>
        <div className="mx-auto max-w-4xl rounded-[32px] border border-neutral-200 bg-surface px-8 py-20 text-center shadow-sm md:px-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Join The Community
          </span>

          <h2
            className="mt-5 text-4xl font-semibold leading-tight md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
            }}
          >
            Stay Ahead of Every Drop.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Subscribe to receive exclusive collections, early access,
            premium offers and the latest releases from Tema Label.
          </p>

          <SubscribeForm />
        </div>
      </Container>
    </Section>
  );
}