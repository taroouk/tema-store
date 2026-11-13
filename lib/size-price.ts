/** Sizes 3XL and up (3XL, 4XL, 5XL…) use the product's "large" price when it has one. */
export function isLargeSize(size: string): boolean {
  const s = size.trim().toUpperCase().replace(/\s+/g, "");
  return /^([3-9])XL$/.test(s) || /^X{3,}L$/.test(s);
}

/** Kids age-range sizes: "2-6Y", "7-9Y", "10-14Y". Returns the first age of the range, or null. */
export function kidsAgeStart(size: string): number | null {
  const m = size.trim().match(/^(\d{1,2})\s*[-–]\s*\d{1,2}\s*Y?$/i);
  return m ? Number(m[1]) : null;
}

export const KIDS_SIZES = ["2-6Y", "7-9Y", "10-14Y"];

type Priced = {
  price: number;
  priceLarge?: number | null;
  /** Kids 7–9Y price (null = same as `price`). */
  priceKids7?: number | null;
  /** Kids 10–14Y price (null = same as `price`). */
  priceKids10?: number | null;
};

export function priceForSize(p: Priced, size: string): number {
  const age = kidsAgeStart(size);
  if (age !== null) {
    if (age >= 10 && p.priceKids10 != null) return p.priceKids10;
    if (age >= 7 && age < 10 && p.priceKids7 != null) return p.priceKids7;
    return p.price;
  }
  return p.priceLarge != null && isLargeSize(size) ? p.priceLarge : p.price;
}

const ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "4XL", "5XL"];
const rank = (s: string) => {
  const age = kidsAgeStart(s);
  if (age !== null) return age - 100; // kids ages first, youngest → oldest
  const i = ORDER.indexOf(s.trim().toUpperCase());
  return i === -1 ? ORDER.length : i;
};
/** Sorts sizes S → 5XL (unknown sizes go last, keeping their order). */
export const sortSizes = (sizes: string[]) => [...sizes].sort((a, b) => rank(a) - rank(b));
