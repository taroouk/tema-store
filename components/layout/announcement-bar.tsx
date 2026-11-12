"use client";

import { useEffect, useState } from "react";

import { bundleLines } from "@/lib/pricing";
import { useAnnouncement, usePricing } from "@/components/catalog/catalog-provider";

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const { freeShippingThreshold } = usePricing();
  const announcement = useAnnouncement();
  const pricing = usePricing();
  const offer = bundleLines(pricing.bundle);
  const offerMessages = offer.en.map((en, i) => (offer.ar[i] ? `${en}  |  ${offer.ar[i]}` : en));
  const messages = [
    ...offerMessages,
    `FREE SHIPPING ON ORDERS OVER ${freeShippingThreshold} EGP`,
    announcement || "NEW ARRIVALS ARE LIVE",
    "EASY RETURNS WITHIN 14 DAYS",
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  return (
    <div role="region" aria-label="Store announcements" className="flex h-8 items-center justify-center bg-foreground px-4">
      <p
        key={current}
        className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-background transition-opacity duration-300"
      >
        {messages[current]}
      </p>
    </div>
  );
}