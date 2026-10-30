import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()]);

  const categoryRoutes = categories.map((c) => `/${c.slug}`);
  const staticRoutes = ["", ...categoryRoutes, "/new-in"].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  const productRoutes = allProducts.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
