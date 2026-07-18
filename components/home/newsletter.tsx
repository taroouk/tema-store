import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function Newsletter() {
  return (
    <Section className="py-24">
      <Container>
        <div className="mx-auto max-w-4xl rounded-[32px] border border-neutral-200 bg-white px-8 py-20 text-center shadow-sm md:px-16">
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
            premium offers and the latest releases from TEMA.
          </p>

          <form className="mx-auto mt-12 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-14 flex-1 rounded-full border border-neutral-300 bg-white px-6 text-base outline-none transition-all placeholder:text-neutral-400 focus:border-black"
            />

            <button
              type="submit"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black px-8 font-medium text-white transition-all duration-300 hover:bg-neutral-800"
            >
              Subscribe

              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-500">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </Container>
    </Section>
  );
}