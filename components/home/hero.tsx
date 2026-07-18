"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative h-[calc(100vh-112px)] min-h-[720px] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero.jpg"
        alt="TEMA Summer Collection"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="max-w-[560px] text-left text-white"
          >
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}