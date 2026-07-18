import type { Product } from "@/types/product";

export const bestSellers: Product[] = [
  {
    id: "5",

    slug: "heavyweight-oversized-tee",

    name: "Heavyweight Oversized Tee",

    description:
      "Premium heavyweight cotton oversized t-shirt built for everyday luxury.",

    price: 599,

    compareAtPrice: 699,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-5.png",
        alt: "Heavyweight Oversized Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-5-hover.png",
        alt: "Heavyweight Oversized Tee Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
      {
        id: "white",
        name: "White",
        value: "#FFFFFF",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    stock: 18,

    featured: true,

    badge: "BEST SELLER",
  },

  {
    id: "6",

    slug: "classic-logo-tee",

    name: "Classic Logo Tee",

    description:
      "Minimal premium t-shirt with embroidered front logo.",

    price: 499,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-6.png",
        alt: "Classic Logo Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-6-hover.png",
        alt: "Classic Logo Tee Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    stock: 10,
  },

  {
    id: "7",

    slug: "essential-back-print",

    name: "Essential Back Print",

    description:
      "Oversized premium fit featuring signature TEMA artwork.",

    price: 649,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-7.png",
        alt: "Essential Back Print Front",
      },
      {
        id: "back",
        src: "/images/products/product-7-hover.png",
        alt: "Essential Back Print Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
      {
        id: "gray",
        name: "Gray",
        value: "#9CA3AF",
      },
    ],

    sizes: ["M", "L", "XL"],

    stock: 15,

    badge: "BEST SELLER",
  },

  {
    id: "8",

    slug: "minimal-relaxed-fit",

    name: "Minimal Relaxed Fit",

    description:
      "Timeless relaxed silhouette designed for everyday wear.",

    price: 549,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-8.png",
        alt: "Minimal Relaxed Fit Front",
      },
      {
        id: "back",
        src: "/images/products/product-8-hover.png",
        alt: "Minimal Relaxed Fit Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
      {
        id: "beige",
        name: "Beige",
        value: "#D9C8B4",
      },
    ],

    sizes: ["S", "M", "L", "XL", "XXL"],

    stock: 20,
  },
];