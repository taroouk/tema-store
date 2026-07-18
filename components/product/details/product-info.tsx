"use client";

import { Heart, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { SizeGuide } from "@/components/product/size-guide";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({
  product,
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]
  );

  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0]
  );

  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);

  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;

    addItem(
      product.id,
      selectedColor.id,
      selectedSize,
      quantity
    );

    toast.success("Added to cart", {
      description: `${product.name} — ${selectedColor.name}, ${selectedSize}`,
    });
  };

  return (
    <div className="flex flex-col">
      {/* Badge */}

      {product.badge && (
        <span className="mb-5 w-fit rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          {product.badge}
        </span>
      )}

      {/* Title */}

      <h1
        className="text-4xl font-semibold md:text-5xl"
        style={{
          fontFamily: "var(--font-heading)",
        }}
      >
        {product.name}
      </h1>

      {/* Reviews */}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className="fill-black text-black"
            />
          ))}
        </div>

        <span className="text-sm text-neutral-500">
          24 Reviews
        </span>
      </div>

      {/* Price */}

      <div className="mt-8 flex items-center gap-4">
        <span className="text-3xl font-semibold">
          EGP {product.price}
        </span>

        {product.compareAtPrice && (
          <span className="text-xl text-neutral-400 line-through">
            EGP {product.compareAtPrice}
          </span>
        )}
      </div>

      {/* Description */}

      <p className="mt-8 max-w-xl leading-8 text-neutral-600">
        {product.description}
      </p>

      {/* Colors */}

      <div className="mt-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
          Color
        </p>

        <div className="flex gap-3">
          {product.colors.map((color) => (
            <button
              key={color.id}
              type="button"
              title={color.name}
              onClick={() => setSelectedColor(color)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                selectedColor.id === color.id
                  ? "border-black"
                  : "border-neutral-300"
              }`}
            >
              <span
                className="h-7 w-7 rounded-full"
                style={{
                  backgroundColor: color.value,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">
            Size
          </p>

          <SizeGuide category={product.category} />
        </div>

        <div className="flex flex-wrap gap-3">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`flex h-12 min-w-[52px] items-center justify-center rounded-xl border px-5 transition ${
                selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}

      <div className="mt-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
          Quantity
        </p>

        <div className="flex w-fit items-center rounded-xl border border-neutral-300">
          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => Math.max(1, prev - 1))
            }
            className="flex h-12 w-12 items-center justify-center"
          >
            <Minus size={18} />
          </button>

          <span className="w-12 text-center">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => prev + 1)
            }
            className="flex h-12 w-12 items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Buttons */}

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inStock ? "Add To Cart" : "Out Of Stock"}
        </button>

        <button className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 transition hover:border-black">
          <Heart size={20} />
        </button>
      </div>

      {/* Stock */}

      <p className="mt-8 text-sm text-neutral-500">
        {product.stock > 0
          ? `${product.stock} items available`
          : "Out of stock"}
      </p>
    </div>
  );
}