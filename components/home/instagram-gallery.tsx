import Image from "next/image";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { getSettings } from "@/lib/settings";

const gallery = [
  { id: 1, src: "/images/products/product-1.png", alt: "Tema Label Look 1" },
  { id: 2, src: "/images/products/product-3.png", alt: "Tema Label Look 2" },
  { id: 3, src: "/images/products/product-5.png", alt: "Tema Label Look 3" },
  { id: 4, src: "/images/products/product-7.png", alt: "Tema Label Look 4" },
  { id: 5, src: "/images/products/product-9.png", alt: "Tema Label Look 5" },
  { id: 6, src: "/images/products/product-11.png", alt: "Tema Label Look 6" },
];

export async function InstagramGallery() {
  const profile = (await getSettings()).links.instagram;
  // Only shown once a real Instagram profile is configured in constants/site.ts.
  if (!profile) return null;

  return (
    <Section className="py-24">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            @tema
          </span>

          <h2
            className="text-4xl font-semibold tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Follow Our Story
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {gallery.map((item) => (
            <a
              key={item.id}
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.alt}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 16vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}
