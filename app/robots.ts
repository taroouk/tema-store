import type { MetadataRoute } from "next";

import { siteConfig } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cart", "/checkout", "/wishlist", "/track", "/search"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
