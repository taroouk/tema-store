"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useUiStore } from "@/stores/ui-store";

import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
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
  const openCart = useUiStore((state) => state.openCart);

  const wished = useWishlistStore((state) =>
    state.items.includes(product.id)
  );
  const toggle = useWishlistStore((state) => state.toggle);

  const inStock = product.stock > 0;

  const variantStock = (colorId: string, size: string) =>
    product.variants?.find((v) => v.colorId === colorId && v.size === size)?.stock ?? (inStock ? 99 : 0);
  const sizeAvailable = (size: string) => variantStock(selectedColor.id, size) > 0;
  const colorAvailable = (colorId: string) => product.sizes.some((s) => variantStock(colorId, s) > 0);
  const selectedStock = variantStock(selectedColor.id, selectedSize);
  const canBuy = inStock && selectedStock > 0;

  // Keep the selection valid when a color has no stock for the chosen size.
  const pickColor = (color: (typeof product.colors)[number]) => {
    setSelectedColor(color);
    if (variantStock(color.id, selectedSize) <= 0) {
      const next = product.sizes.find((s) => variantStock(color.id, s) > 0);
      if (next) setSelectedSize(next);
    }
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!canBuy) return;

    addItem(
      product.id,
      selectedColor.id,
      selectedSize,
      quantity
    );

    openCart();
  };

  return (
    <div className="flex flex-col">
      {/* Badge */}

      {product.badge && (
        <span className="mb-5 w-fit rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-background">
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

      {/* Price */}

      <div className="mt-8 flex items-center gap-4">
        <span className="text-3xl font-semibold">
          EGP {product.price}
        </span>

        {product.compareAtPrice && (
          <span className="text-xl text-neutral-500 line-through">
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
              onClick={() => pickColor(color)}
              aria-pressed={selectedColor.id === color.id}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                selectedColor.id === color.id
                  ? "border-foreground"
                  : "border-neutral-300"
              } ${colorAvailable(color.id) ? "" : "opacity-40"}`}
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
              disabled={!sizeAvailable(size)}
              aria-pressed={selectedSize === size}
              onClick={() => {
                setSelectedSize(size);
                setQuantity(1);
              }}
              className={`flex h-12 min-w-[52px] items-center justify-center rounded-xl border px-5 transition disabled:cursor-not-allowed disabled:text-neutral-400 disabled:line-through ${
                selectedSize === size
                  ? "border-foreground bg-foreground text-background"
                  : "border-neutral-300 hover:border-foreground disabled:hover:border-neutral-300"
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
            aria-label="Decrease quantity"
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
              setQuantity((prev) => Math.min(Math.min(selectedStock, 10), prev + 1))
            }
            aria-label="Increase quantity"
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
          disabled={!canBuy}
          className="flex-1 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canBuy ? "Add To Bag" : "Out Of Stock"}
        </button>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className={`flex h-14 w-14 items-center justify-center rounded-full border transition hover:border-foreground ${
            wished ? "border-foreground" : "border-neutral-300"
          }`}
        >
          <Heart
            size={20}
            className={wished ? "fill-foreground text-foreground" : "text-foreground"}
          />
        </button>
      </div>

      {/* Stock */}

      <p className="mt-8 text-sm text-neutral-500">
        {!canBuy
          ? "This combination is out of stock"
          : selectedStock <= 5
            ? `Only ${selectedStock} left — order soon`
            : "In stock · ships within 24 hours"}
      </p>
    </div>
  );
}