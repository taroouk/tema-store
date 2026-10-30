import Image from "next/image";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function BrandStory() {
  return (
    <Section className="py-16 md:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[5fr_6fr] lg:gap-16">
          {/* Image */}

          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-black/5 lg:max-w-none">
            <Image
              src="/images/editorial/homepage-2.png"
              alt="Tema Label Brand Story"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover object-[center_20%]"
            />
          </div>

          {/* Content */}

          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-neutral-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Our Story</span>
            </div>

            <h2
              className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Timeless essentials,
              <br />
              made to last.
            </h2>

            <div className="mt-8 space-y-6 text-neutral-600">
              <p className="leading-8">
                Tema Label was born from a simple belief: that everyday clothing
                deserves the same care as couture. We design quiet, considered
                pieces meant to be worn for years, not seasons.
              </p>

              <p className="leading-8">
                Every garment is crafted from premium fabrics and finished
                with obsessive attention to detail — a minimal aesthetic built
                on quality, not noise.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 md:gap-4">
              <div className="rounded-2xl border border-neutral-200 p-4 md:p-5">
                <p
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  100%
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Premium Cotton
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4 md:p-5">
                <p
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  EG
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Made in Egypt
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4 md:p-5">
                <p
                  className="text-2xl md:text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  14d
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Easy Exchange
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
