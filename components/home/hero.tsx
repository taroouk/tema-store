"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

// Add, remove or reorder slides here (files live in public/images).
const SLIDES = [1, 2, 3, 4, 5].map((n) => `/images/hero-${n}.png`);
const SLIDE_MS = 2000;

export function Hero() {
  const [active, setActive] = useState(0);
  // Bumped when a visitor picks a slide, so the 2 s timer restarts from that moment.
  const [tick, setTick] = useState(0);

  // Endless loop: advance every 2 seconds and wrap back to the first slide.
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collection"
      className="relative h-[calc(100svh-88px)] min-h-[520px] w-full overflow-hidden bg-neutral-900 md:max-h-[860px]"
    >
      {/* Background slideshow */}
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? "Tema Label Summer Collection" : ""}
          aria-hidden={i === active ? undefined : true}
          fill
          sizes="100vw"
          priority={i === 0}
          fetchPriority={i === 0 ? "high" : "auto"}
          className={`object-cover object-center transition-opacity duration-700 motion-reduce:transition-none ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Readability: darker on the text side, fading out over the photo; extra shade at the bottom for the controls */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="animate-hero-in max-w-[520px] text-left text-white">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-10 bg-white/70" />
              <span className="text-xs font-medium uppercase tracking-[0.35em] text-white/90">Summer 2026</span>
            </div>

            <h1
              className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-6xl xl:text-7xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Wear your
              <br />
              identity.
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-white/85 md:text-lg">
              Timeless. Essential. Modern. Authentic.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href="/men">Shop Men</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[160px] border-white/80 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black"
              >
                <Link href="/women">Shop Women</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute inset-x-0 bottom-6 z-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 px-6 md:px-10 xl:px-16">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
              aria-current={i === active}
              onClick={() => {
                setActive(i);
                setTick((t) => t + 1);
              }}
              className="group -my-3 py-3"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-white" : "w-5 bg-white/45 group-hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
