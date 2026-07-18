import type { Product } from "@/types/product";

export const newArrivals: Product[] = [
  {
    id: "1",

    slug: "essential-oversized-tee",

    name: "Essential Oversized Tee",

    description:
      "Premium heavyweight oversized t-shirt made for everyday wear.",

    price: 499,

    compareAtPrice: 599,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-1.png",
        alt: "Essential Oversized Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-1-hover.png",
        alt: "Essential Oversized Tee Back",
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
      {
        id: "beige",
        name: "Beige",
        value: "#D9C8B4",
      },
    ],

    sizes: ["S", "M", "L", "XL"],

    stock: 24,

    featured: true,

    badge: "NEW",
  },

  {
    id: "2",

    slug: "minimal-logo-tee",

    name: "Minimal Logo Tee",

    description:
      "Clean oversized silhouette with premium cotton construction.",

    price: 499,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-2.png",
        alt: "Minimal Logo Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-2-hover.png",
        alt: "Minimal Logo Tee Back",
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

    stock: 14,

    badge: "NEW",
  },

  {
    id: "3",

    slug: "et-back-print-tee",

    name: "ET Back Print Tee",

    description:
      "Signature back print with relaxed premium oversized fit.",

    price: 549,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-3.png",
        alt: "ET Back Print Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-3-hover.png",
        alt: "ET Back Print Tee Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
      {
        id: "brown",
        name: "Brown",
        value: "#6E5846",
      },
    ],

    sizes: ["M", "L", "XL"],

    stock: 8,

    badge: "NEW",
  },

  {
    id: "4",

    slug: "relaxed-fit-tee",

    name: "Relaxed Fit Tee",

    description:
      "Heavyweight cotton everyday essential with timeless fit.",

    price: 549,

    compareAtPrice: 649,

    category: "men",

    images: [
      {
        id: "front",
        src: "/images/products/product-4.png",
        alt: "Relaxed Fit Tee Front",
      },
      {
        id: "back",
        src: "/images/products/product-4-hover.png",
        alt: "Relaxed Fit Tee Back",
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

    sizes: ["S", "M", "L", "XL", "XXL"],

    stock: 30,

    featured: true,

    badge: "NEW",
  },
];