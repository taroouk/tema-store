import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "TEMA is a premium fashion house creating timeless everyday essentials with modern minimal design and premium craftsmanship.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | TEMA",
    description:
      "TEMA is a premium fashion house creating timeless everyday essentials with modern minimal design.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

const values = [
  {
    title: "Quality",
    description:
      "We use only premium fabrics and obsessive construction for pieces built to last.",
  },
  {
    title: "Simplicity",
    description:
      "Timeless silhouettes and a quiet aesthetic that never goes out of style.",
  },
  {
    title: "Responsibility",
    description:
      "Considered production, honest pricing, and respect for the people who make it.",
  },
  {
    title: "Craft",
    description:
      "Every garment is finished with attention to detail you can feel.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="py-16">
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Our Story
            </span>

            <h1
              className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Timeless essentials, made to last.
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-600">
              TEMA was born from a simple belief: that everyday clothing
              deserves the same care as couture. We design quiet, considered
              pieces meant to be worn for years, not seasons.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="py-8">
        <Container>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[32px] bg-neutral-100">
            <Image
              src="/images/editorial/editorial.PNG"
              alt="TEMA editorial"
              fill
              className="object-cover"
            />
          </div>
        </Container>
      </Section>

      <Section className="py-16">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2
                className="text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Mission
              </h2>
              <p className="mt-6 leading-8 text-neutral-600">
                To make premium, everyday essentials accessible — garments that
                feel considered, look refined, and hold up to real life.
              </p>
            </div>

            <div>
              <h2
                className="text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Vision
              </h2>
              <p className="mt-6 leading-8 text-neutral-600">
                A wardrobe built on fewer, better things. We imagine a future
                where what you wear is intentional, durable, and quietly
                beautiful.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-16">
        <Container>
          <h2
            className="mb-12 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our Values
          </h2>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-8">
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="mt-4 leading-7 text-neutral-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button asChild size="lg">
              <a href="/new-in">Explore The Collection</a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
