"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import type { Product } from "@/types/product";
import { useWishlistStore } from "@/stores/wishlist-store";
import { SmartImage } from "@/components/ux/smart-image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  const hoverImage = product.images[1];

  const wished = useWishlistStore((state) => state.items.includes(product.id));
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
          <SmartImage
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            wrapperClassName="absolute inset-0"
            className={`object-cover transition-all duration-700 ${
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
            }`}
          />

          {hoverImage && (
            <SmartImage
              src={hoverImage.src}
              alt={hoverImage.alt}
              fill
              wrapperClassName="absolute inset-0"
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm">
              {product.badge}
            </span>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              toggle(product.id);
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 group-hover:opacity-100"
          >
            <Heart
              size={18}
              className={wished ? "fill-black text-black" : "text-black"}
            />
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-medium">{product.name}</h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium">
              EGP {product.price}
            </span>

            {product.compareAtPrice && (
              <span className="text-sm text-neutral-400 line-through">
                EGP {product.compareAtPrice}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-3.5 w-3.5 rounded-full border border-neutral-300"
                  style={{
                    backgroundColor: color.value,
                  }}
                />
              ))}
            </div>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border transition hover:bg-black hover:text-white"
              aria-label="Add to cart"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}