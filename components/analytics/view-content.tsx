"use client";

import { useEffect, useRef } from "react";

import { trackViewContent } from "@/lib/meta-events";

/** Fires ViewContent once per product page view. */
export function ViewContent({ id, name, value }: { id: string; name: string; value: number }) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (sent.current === id) return;
    sent.current = id;
    trackViewContent({ id, name, value });
  }, [id, name, value]);
  return null;
}
