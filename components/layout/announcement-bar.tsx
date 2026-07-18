"use client";

import { useEffect, useState } from "react";

const messages = [
  "FREE SHIPPING ON ORDERS OVER 1500 EGP",
  "SUMMER '26 COLLECTION NOW LIVE",
  "EASY RETURNS WITHIN 14 DAYS",
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex h-8 items-center justify-center bg-black px-4">
      <p
        key={current}
        className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-white transition-opacity duration-300"
      >
        {messages[current]}
      </p>
    </div>
  );
}