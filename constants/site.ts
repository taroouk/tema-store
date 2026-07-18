export const siteConfig = {
  name: "TEMA",

  description:
    "Premium fashion brand delivering timeless essentials with modern minimal design.",

  url: "https://tema.com",

  ogImage: "/images/og-image.png",

  links: {
    instagram: "",
    tiktok: "",
    facebook: "",
    x: "",
    pinterest: "",
  },

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