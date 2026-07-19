"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "@/components/common/container";

export function EditorialBanner() {
  return (
    <section className="py-24">
      <Container>
        <div className="overflow-hidden rounded-[32px] bg-neutral-100">
          <div className="grid items-center lg:grid-cols-2">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center p-10 md:p-14 xl:p-20"
            >
              <span className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                Summer 2026
              </span>

              <h2
                className="text-4xl font-semibold leading-tight md:text-5xl xl:text-6xl"
                style={{
                  fontFamily: "var(--font-heading)",
                }}
              >
                Crafted for
                <br />
                Everyday Luxury.
              </h2>

              <p className="mt-8 max-w-md leading-8 text-neutral-600">
                Every piece is designed with premium fabrics, timeless
                silhouettes and modern craftsmanship to become part of your
                everyday wardrobe.
              </p>

              <Link
                href="/collections/summer"
                className="mt-10 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:gap-5"
              >
                Discover Collection

                <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/4] lg:aspect-[4/5]"
            >
              <Image
                src="/images/editorial/editorial.PNG"
                alt="TEMA Editorial Campaign"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}