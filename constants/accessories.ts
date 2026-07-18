import type { Product } from "@/types/product";

export const accessories: Product[] = [
  {
    id: "13",

    slug: "signature-cap",

    name: "Signature Cap",

    description:
      "Premium embroidered cap with an adjustable strap.",

    price: 349,

    compareAtPrice: 399,

    category: "accessories",

    images: [
      {
        id: "front",
        src: "/images/products/product-13.png",
        alt: "Signature Cap Front",
      },
      {
        id: "back",
        src: "/images/products/product-13-hover.png",
        alt: "Signature Cap Back",
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

    sizes: ["ONE SIZE"],

    stock: 30,

    featured: true,

    badge: "NEW",
  },

  {
    id: "14",

    slug: "canvas-tote",

    name: "Canvas Tote",

    description:
      "Heavyweight organic cotton tote for everyday carry.",

    price: 299,

    category: "accessories",

    images: [
      {
        id: "front",
        src: "/images/products/product-14.png",
        alt: "Canvas Tote Front",
      },
      {
        id: "back",
        src: "/images/products/product-14-hover.png",
        alt: "Canvas Tote Back",
      },
    ],

    colors: [
      {
        id: "white",
        name: "White",
        value: "#FFFFFF",
      },
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
    ],

    sizes: ["ONE SIZE"],

    stock: 25,

    badge: "NEW",
  },

  {
    id: "15",

    slug: "knit-beanie",

    name: "Knit Beanie",

    description:
      "Soft ribbed knit beanie with a clean minimal finish.",

    price: 279,

    compareAtPrice: 329,

    category: "accessories",

    images: [
      {
        id: "front",
        src: "/images/products/product-15.png",
        alt: "Knit Beanie Front",
      },
      {
        id: "back",
        src: "/images/products/product-15-hover.png",
        alt: "Knit Beanie Back",
      },
    ],

    colors: [
      {
        id: "gray",
        name: "Gray",
        value: "#9CA3AF",
      },
      {
        id: "brown",
        name: "Brown",
        value: "#6E5846",
      },
    ],

    sizes: ["ONE SIZE"],

    stock: 18,

    featured: true,

    badge: "NEW",
  },

  {
    id: "16",

    slug: "leather-belt",

    name: "Leather Belt",

    description:
      "Minimal full-grain leather belt with a matte buckle.",

    price: 399,

    category: "accessories",

    images: [
      {
        id: "front",
        src: "/images/products/product-16.png",
        alt: "Leather Belt Front",
      },
      {
        id: "back",
        src: "/images/products/product-16-hover.png",
        alt: "Leather Belt Back",
      },
    ],

    colors: [
      {
        id: "black",
        name: "Black",
        value: "#000000",
      },
    ],

    sizes: ["S", "M", "L"],

    stock: 12,
  },
];
