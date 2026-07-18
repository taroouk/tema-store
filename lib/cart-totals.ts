import { allProducts } from "@/constants/all-products";
import type { CartItem } from "@/stores/cart-store";

export interface CartTotals {
  items: (CartItem & {
    name: string;
    price: number;
    image: string;
    colorName: string;
  })[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
}

export const FREE_SHIPPING_THRESHOLD = 1500;
export const FLAT_SHIPPING = 80;

export function getCartTotals(items: CartItem[]): CartTotals {
  const detailed = items
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);

      if (!product) return null;

      const colorName =
        product.colors.find((c) => c.id === item.colorId)?.name ??
        item.colorId;

      return {
        ...item,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src ?? "",
        colorName,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = detailed.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const count = detailed.reduce((total, item) => total + item.quantity, 0);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

  return {
    items: detailed,
    subtotal,
    shipping,
    total: subtotal + shipping,
    count,
  };
}
