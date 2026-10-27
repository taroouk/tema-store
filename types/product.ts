export type ProductBadge =
  | "NEW"
  | "BEST SELLER"
  | "LIMITED"
  | "SOLD OUT";

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
}

export interface ProductColor {
  id: string;
  name: string;
  value: string;
}

export interface VariantStock {
  colorId: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;

  slug: string;

  name: string;

  description: string;

  price: number;

  /** Price for 3XL–5XL when it differs from `price`. */
  priceLarge?: number;

  compareAtPrice?: number;

  /** Category slug (from Admin → Categories). */
  category: string;

  categoryName?: string;

  images: ProductImage[];

  colors: ProductColor[];

  sizes: string[];

  stock: number;

  /** Per color/size availability (omitted for static catalog data). */
  variants?: VariantStock[];

  material?: string;
  careInstructions?: string;
  metaTitle?: string;
  metaDescription?: string;
  sku?: string;

  /** ISO timestamp of the last edit (used for the sitemap). */
  updatedAt?: string;

  featured?: boolean;

  badge?: ProductBadge;
}