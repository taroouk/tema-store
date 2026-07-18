import { newArrivals } from "@/constants/products";
import { bestSellers } from "@/constants/best-sellers";
import { women } from "@/constants/women";
import { accessories } from "@/constants/accessories";

import type { Product } from "@/types/product";

export const allProducts: Product[] = [
  ...newArrivals,
  ...bestSellers,
  ...women,
  ...accessories,
];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}
