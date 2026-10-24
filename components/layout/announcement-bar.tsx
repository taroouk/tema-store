"use client";

import { useEffect, useState } from "react";

import { useAnnouncement, usePricing } from "@/components/catalog/catalog-provider";

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const { freeShippingThreshold } = usePricing();
  const announcement = useAnnouncement();
  const messages = [
    `FREE SHIPPING ON ORDERS OVER ${freeShippingThreshold} EGP`,
    announcement || "SUMMER '26 COLLECTION NOW LIVE",
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