"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
import { allProducts } from "@/constants/all-products";

interface CartItemProps {
  item: {
    productId: string;
    quantity: number;
    size: string;
    colorId: string;
  };
}

const products = allProducts;

export function CartItem({
  item,
}: CartItemProps) {
  const product = products.find(
    (product) => product.id === item.productId
  );

  const increase = useCartStore((state) => state.increase);

  const decrease = useCartStore((state) => state.decrease);

  const remove = useCartStore((state) => state.removeItem);

  if (!product) return null;

  return (
    <article className="flex gap-6 border-b border-neutral-200 pb-8">
      <div className="relative h-40 w-32 overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="text-xl font-medium">
            {product.name}
          </h2>

          <p className="mt-2 text-neutral-500">
            Size: {item.size}
          </p>

          <p className="text-neutral-500">
            Color: {product.colors.find((color) => color.id === item.colorId)?.name ?? item.colorId}
          </p>

          <p className="mt-4 text-lg font-semibold">
            EGP {product.price}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border">
            <button
              onClick={() =>
                decrease(item.productId, item.colorId, item.size)
              }
              className="flex h-11 w-11 items-center justify-center"
            >
              <Minus size={16} />
            </button>

            <span className="w-10 text-center">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                increase(item.productId, item.colorId, item.size)
              }
              className="flex h-11 w-11 items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={() =>
              remove(item.productId, item.colorId, item.size)
            }
            className="text-neutral-500 transition hover:text-red-500"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}