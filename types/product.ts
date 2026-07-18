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

export interface Product {
  id: string;

  slug: string;

  name: string;

  description: string;

  price: number;

  compareAtPrice?: number;

  category: "men" | "women" | "accessories";

  images: ProductImage[];

  colors: ProductColor[];

  sizes: string[];

  stock: number;

  featured?: boolean;

  badge?: ProductBadge;
}