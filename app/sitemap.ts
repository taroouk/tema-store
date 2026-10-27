import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";
import { getCategories, getCollections, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [allProducts, collections, categories] = await Promise.all([getProducts(), getCollections(), getCategories()]);

  const categoryRoutes = categories.map((c) => `/${c.slug}`);
  const staticRoutes = ["", ...categoryRoutes, "/new-in", "/collections"].map(
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

  const collectionRoutes = collections.map((collection) => ({
    url: `${base}/collections/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
