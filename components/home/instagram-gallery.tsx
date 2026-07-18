import Image from "next/image";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

const gallery = [
  { id: 1, src: "/images/products/product-1.png", alt: "TEMA Look 1" },
  { id: 2, src: "/images/products/product-3.png", alt: "TEMA Look 2" },
  { id: 3, src: "/images/products/product-5.png", alt: "TEMA Look 3" },
  { id: 4, src: "/images/products/product-7.png", alt: "TEMA Look 4" },
  { id: 5, src: "/images/products/product-9.png", alt: "TEMA Look 5" },
  { id: 6, src: "/images/products/product-11.png", alt: "TEMA Look 6" },
];

export function InstagramGallery() {
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
              href="#"
              aria-label={item.alt}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
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
