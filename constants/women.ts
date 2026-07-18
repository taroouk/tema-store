import type { Product } from "@/types/product";

export const women: Product[] = [
  {
    id: "9",

    slug: "women-oversized-tee",

    name: "Women Oversized Tee",

    description:
      "Relaxed premium cotton oversized t-shirt with a soft hand feel.",

    price: 499,

    compareAtPrice: 599,

    category: "women",

    images: [
      {
        id: "front",
        src: "/images/products/product-9.png",
        alt: "Women Oversized Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-9-hover.png",
        alt: "Women Oversized Tee Back",
      },
    ],

    colors: [
      {
        id: "beige",
        name: "Beige",
        value: "#D9C8B4",
      },
      {
        id: "white",
        name: "White",
        value: "#FFFFFF",
      },
    ],

    sizes: ["XS", "S", "M", "L"],

    stock: 22,

    featured: true,

    badge: "NEW",
  },

  {
    id: "10",

    slug: "women-essential-tee",

    name: "Women Essential Tee",

    description:
      "Clean minimal silhouette in premium breathable cotton.",

    price: 459,

    category: "women",

    images: [
      {
        id: "front",
        src: "/images/products/product-10.png",
        alt: "Women Essential Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-10-hover.png",
        alt: "Women Essential Tee Back",
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

    sizes: ["XS", "S", "M", "L"],

    stock: 16,

    badge: "NEW",
  },

  {
    id: "11",

    slug: "women-relaxed-tee",

    name: "Women Relaxed Tee",

    description:
      "Heavyweight everyday essential with a timeless relaxed fit.",

    price: 549,

    compareAtPrice: 649,

    category: "women",

    images: [
      {
        id: "front",
        src: "/images/products/product-11.png",
        alt: "Women Relaxed Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-11-hover.png",
        alt: "Women Relaxed Tee Back",
      },
    ],

    colors: [
      {
        id: "white",
        name: "White",
        value: "#FFFFFF",
      },
      {
        id: "brown",
        name: "Brown",
        value: "#6E5846",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    stock: 9,

    featured: true,

    badge: "NEW",
  },

  {
    id: "12",

    slug: "women-classic-tee",

    name: "Women Classic Tee",

    description:
      "Signature front logo tee with a premium structured fit.",

    price: 499,

    category: "women",

    images: [
      {
        id: "front",
        src: "/images/products/product-12.png",
        alt: "Women Classic Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-12-hover.png",
        alt: "Women Classic Tee Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
    ],

    sizes: ["XS", "S", "M", "L"],

    stock: 14,
  },
];
