import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/common/container";

export function EditorialBanner() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="grid overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-black/5 lg:grid-cols-2">
          {/* Content */}
          <div className="order-2 flex flex-col justify-center p-8 md:p-12 xl:p-16 lg:order-1">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-neutral-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Summer 2026</span>
            </div>

            <h2
              className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Crafted for
              <br />
              everyday luxury.
            </h2>

            <p className="mt-6 max-w-md leading-7 text-neutral-600">
              Premium fabrics, timeless silhouettes and modern craftsmanship, designed to become part of your everyday
              wardrobe.
            </p>

            <Link
              href="/new-in"
              className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-background transition-all hover:gap-5 hover:opacity-90"
            >
              Shop new arrivals
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Image */}
          <div className="relative order-1 aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[560px]">
            <Image
              src="/images/editorial/homepage-1.png"
              alt="Tema Label summer campaign"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_22%]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
