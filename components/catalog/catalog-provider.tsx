"use client";

import { createContext, useContext, useMemo } from "react";

import { DEFAULT_PAYMENTS, DEFAULT_PRICING, type PaymentConfig, type PricingSettings } from "@/lib/pricing";
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

export interface NavCategory {
  slug: string;
  name: string;
}

const CATEGORY_ORDER = ["men", "women", "accessories"];

/** Every category that currently has at least one product, in a stable order (men, women, accessories, then A–Z). */
export function useCategories(): NavCategory[] {
  const products = useCatalog();
  return useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.category, p.categoryName ?? p.category.charAt(0).toUpperCase() + p.category.slice(1));
    const rank = (s: string) => {
      const i = CATEGORY_ORDER.indexOf(s);
      return i === -1 ? CATEGORY_ORDER.length : i;
    };
    return [...map.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
  }, [products]);
}
