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

  // Endless loop: advance every 2 seconds and wrap back to the first slide.
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[calc(100vh-112px)] min-h-[720px] w-full overflow-hidden">
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

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="animate-hero-in max-w-[560px] text-left text-white">
            {/* Top Label */}
            <div className="mb-8 flex items-center gap-5">
              <span className="text-sm uppercase tracking-[0.35em]">
                Summer 2026
              </span>

              <span className="h-px w-24 bg-white/70" />
            </div>

            {/* Heading */}
            <h1
              className="text-6xl font-semibold leading-[0.9] tracking-[-0.05em] md:text-7xl xl:text-[96px]"
              style={{
                fontFamily: "var(--font-heading)",
              }}
            >
              WEAR
              <br />
              YOUR
              <br />
              IDENTITY.
            </h1>

            {/* Subtitle */}
            <p className="mt-8 max-w-md text-lg leading-8 text-white/90">
              Timeless. Essential. Modern. Authentic.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="min-w-[170px]"
              >
                <Link href="/men">SHOP MEN</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[170px] border-white bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black"
              >
                <Link href="/women">SHOP WOMEN</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}