"use client";

import { createContext, useContext, useMemo } from "react";

import { DEFAULT_PAYMENTS, DEFAULT_PRICING, type PaymentConfig, type PricingSettings } from "@/lib/pricing";
import { siteConfig } from "@/constants/site";
import type { Product } from "@/types/product";

const CatalogContext = createContext<Product[]>([]);
const PricingContext = createContext<PricingSettings>(DEFAULT_PRICING);
const AnnouncementContext = createContext("");
const PaymentsContext = createContext<PaymentConfig>(DEFAULT_PAYMENTS);

/** Gives client components (cart, wishlist, search) access to the live catalog. */
export function CatalogProvider({
  products,
  pricing,
  announcement = "",
  payments = DEFAULT_PAYMENTS,
  children,
}: {
  products: Product[];
  pricing: PricingSettings;
  announcement?: string;
  payments?: PaymentConfig;
  children: React.ReactNode;
}) {
  return (
    <CatalogContext.Provider value={products}>
      <PricingContext.Provider value={pricing}>
        <AnnouncementContext.Provider value={announcement}>
          <PaymentsContext.Provider value={payments}>{children}</PaymentsContext.Provider>
        </AnnouncementContext.Provider>
      </PricingContext.Provider>
    </CatalogContext.Provider>
  );
}

export function usePayments() {
  return useContext(PaymentsContext);
}

export function useAnnouncement() {
  return useContext(AnnouncementContext);
}

export function usePricing() {
  return useContext(PricingContext);
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useProduct(id: string) {
  const products = useCatalog();
  return useMemo(() => products.find((p) => p.id === id), [products, id]);
}

/** Main-menu links, minus any category that has no products yet (so the menu never leads to an empty page). */
export function useNavigation() {
  const products = useCatalog();
  return useMemo(
    () =>
      siteConfig.navigation.filter((item) => {
        if (item.href === "/new-in") return products.length > 0;
        return products.some((p) => `/${p.category}` === item.href);
      }),
    [products]
  );
}
