"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ThemedToaster } from "@/components/theme/themed-toaster";

import { useCartStore } from "@/stores/cart-store";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { PageTransition } from "@/components/ux/page-transition";

/** Storefront header/footer, hidden inside the admin panel. */
export function SiteChrome({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();

  // The cart is persisted in localStorage; rehydrate after mount to avoid SSR mismatches.
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar />
      <PageTransition>{children}</PageTransition>
      {footer}
      <CartDrawer />
      <ThemedToaster />
    </>
  );
}
