"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fires one Meta Pixel PageView per route (initial load + client-side navigations). */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return; // guards StrictMode double-effect
    last.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
