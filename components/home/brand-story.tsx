import Image from "next/image";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function BrandStory() {
  return (
    <Section className="py-24">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Image */}

          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] bg-neutral-100">
            <Image
              src="/images/editorial/editorial.PNG"
              alt="TEMA Brand Story"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}

          <div>
            <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Our Story
            </span>

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
                TEMA was born from a simple belief: that everyday clothing
                deserves the same care as couture. We design quiet, considered
                pieces meant to be worn for years, not seasons.
              </p>

              <p className="leading-8">
                Every garment is crafted from premium fabrics and finished
                with obsessive attention to detail — a minimal aesthetic built
                on quality, not noise.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-10">
              <div>
                <p
                  className="text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  100%
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Premium Cotton
                </p>
              </div>

              <div>
                <p
                  className="text-3xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  EG
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Made in Egypt
                </p>
              </div>

              <div>
                <p
                  className="text-3xl font-semibold"
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
