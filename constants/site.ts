export const siteConfig = {
  name: "Tema Label",

  /** Other names people use for the brand — exposed to search engines as alternate names. */
  alternateNames: ["Tema", "Tema Store", "Tema Label Store", "تيما ليبل"],

  description:
    "Tema Label — premium everyday essentials: oversized tees, women's pieces and accessories with timeless, minimal design.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://temalabel.com",

  ogImage: "/images/og-image.png",

navigation: [
  {
    title: "Men",
    href: "/men",
  },
  {
    title: "Women",
    href: "/women",
  },
  {
    title: "Accessories",
    href: "/accessories",
  },
  {
    title: "New In",
    href: "/new-in",
  },
],
} as const;

export type SiteConfig = typeof siteConfig;