/** Sizes 3XL and up (3XL, 4XL, 5XL…) use the product's "large" price when it has one. */
export function isLargeSize(size: string): boolean {
  const s = size.trim().toUpperCase().replace(/\s+/g, "");
  return /^([3-9])XL$/.test(s) || /^X{3,}L$/.test(s);
}

export function priceForSize(p: { price: number; priceLarge?: number | null }, size: string): number {
  return p.priceLarge != null && isLargeSize(size) ? p.priceLarge : p.price;
}

const ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "4XL", "5XL"];
const rank = (s: string) => {
  const i = ORDER.indexOf(s.trim().toUpperCase());
  return i === -1 ? ORDER.length : i;
};
/** Sorts sizes S → 5XL (unknown sizes go last, keeping their order). */
export const sortSizes = (sizes: string[]) => [...sizes].sort((a, b) => rank(a) - rank(b));
