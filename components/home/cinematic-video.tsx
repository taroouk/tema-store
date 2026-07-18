"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";

export function CinematicVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (visible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [visible]);

  return (
    <Section className="py-24">
      <Container>
        <div
          ref={containerRef}
          className="relative aspect-video w-full overflow-hidden rounded-[32px] bg-neutral-900"
        >
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero.jpg"
            className="h-full w-full object-cover"
          >
            {/* Placeholder source — replace with the final cinematic film. */}
            <source src="" type="video/mp4" />
          </video>

          {/* Play affordance (placeholder only, no real source yet) */}

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 backdrop-blur">
              <Play size={28} className="ml-1 text-black" fill="black" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              TEMA — The Film
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
