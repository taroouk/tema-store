import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ");

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 80).trim() ?? "";
  const terms = norm(q).split(/\s+/).filter(Boolean);

  const products = terms.length ? await getProducts() : [];
  const results = products.filter((p) => {
    const hay = norm([p.name, p.category, p.description, ...p.colors.map((c) => c.name)].join(" "));
    return terms.every((t) => hay.includes(t));
  });

  return (
    <Container>
      <section className="py-16">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Search</span>
        <h1 className="text-4xl md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
          {q ? <>Results for “{q}”</> : "Search the store"}
        </h1>
        <p className="mt-3 text-neutral-500" aria-live="polite">
          {q ? `${results.length} ${results.length === 1 ? "product" : "products"} found` : "Use the search icon in the header to look for products, categories or colors."}
        </p>

        <div className="mt-12">
          {results.length > 0 ? (
            <ProductGrid products={results} headingLevel="h2" />
          ) : q ? (
            <p className="rounded-3xl border border-dashed border-neutral-300 px-8 py-20 text-center text-neutral-500">
              Nothing matched “{q}”. Try a different word, or browse Men, Women and Accessories from the menu.
            </p>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
