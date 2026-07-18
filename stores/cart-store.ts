import { create } from "zustand";

export interface CartItem {
  productId: string;

  quantity: number;

  colorId: string;

  size: string;
}

interface CartStore {
  items: CartItem[];

  addItem: (
    productId: string,
    colorId: string,
    size: string,
    quantity: number
  ) => void;

  removeItem: (productId: string) => void;

  increase: (productId: string) => void;

  decrease: (productId: string) => void;

  clear: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (productId, colorId, size, quantity) =>
    set((state) => {
      const existing = state.items.find(
        (item) =>
          item.productId === productId &&
          item.colorId === colorId &&
          item.size === size
      );

      if (existing) {
        return {
          items: state.items.map((item) =>
            item === existing
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId,
            colorId,
            size,
            quantity,
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.productId !== productId
      ),
    })),

  increase: (productId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      ),
    })),

  decrease: (productId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      ),
    })),

  clear: () =>
    set({
      items: [],
    }),
}));