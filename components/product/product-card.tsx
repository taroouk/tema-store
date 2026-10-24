"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";

import type { Product } from "@/types/product";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { SmartImage } from "@/components/ux/smart-image";

interface ProductCardProps {
  product: Product;
  /** Use "h2" on listing pages (the page title is the h1); "h3" inside a titled section. */
  headingLevel?: "h2" | "h3";
  /** Above-the-fold cards load their first image eagerly (better LCP). */
  eager?: boolean;
}

const money = (n: number) => `EGP ${n.toLocaleString("en-US")}`;

export function ProductCard({ product, headingLevel: Heading = "h3", eager = false }: ProductCardProps) {
  const primaryImage = product.images[0];
  const hoverImage = product.images[1];
  const soldOut = product.stock <= 0;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount = onSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;
  const defaultColor = product.colors[0];

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUiStore((state) => state.openCart);
  const wished = useWishlistStore((state) => state.items.includes(product.id));
  const toggle = useWishlistStore((state) => state.toggle);

  const available = (size: string) => {
    if (!product.variants || !defaultColor) return !soldOut;
    return product.variants.some((v) => v.colorId === defaultColor.id && v.size === size && v.stock > 0);
  };

  const quickAdd = (event: React.MouseEvent, size: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!defaultColor || !available(size)) return;
    addItem(product.id, defaultColor.id, size, 1);
    openCart();
  };

  const firstAvailable = product.sizes.find(available);

  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
          {primaryImage ? (
            <>
              <SmartImage
                src={primaryImage.src}
                sizes="(min-width: 1024px) 25vw, 50vw"
                alt={primaryImage.alt || product.name}
                fill
                priority={eager}
                fetchPriority={eager ? "high" : undefined}
                wrapperClassName="absolute inset-0"
                className={`object-cover transition-all duration-700 ${
                  hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
                } ${soldOut ? "opacity-60" : ""}`}
              />
              {hoverImage && (
                <SmartImage
                  src={hoverImage.src}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  alt={hoverImage.alt || product.name}
                  fill
                  wrapperClassName="absolute inset-0"
                  className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Tema Label
            </div>
          )}

          <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-2">
            {soldOut ? (
              <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">
                Sold out
              </span>
            ) : (
              <>
                {product.badge && (
                  <span className="max-w-[calc(100%-1rem)] truncate rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm">
                    {product.badge}
                  </span>
                )}
                {onSale && (
                  <span className="rounded-full bg-[#dc2626] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                    −{discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              toggle(product.id);
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md transition-transform duration-300 hover:scale-110"
          >
            <Heart size={18} className={wished ? "fill-red-500 text-red-500" : "text-foreground"} />
          </button>

          {/* Desktop quick add: pick a size without leaving the grid */}
          {!soldOut && product.sizes.length > 0 && (
            <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 gap-1.5 rounded-xl bg-surface/90 p-2 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
              {product.sizes.slice(0, 6).map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={!available(size)}
                  onClick={(event) => quickAdd(event, size)}
                  aria-label={`Add size ${size} to bag`}
                  className="flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-medium transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:text-neutral-400 disabled:line-through disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading className="truncate text-sm font-medium">{product.name}</Heading>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
              <span className={`text-sm font-semibold ${onSale ? "text-red-600" : ""}`}>{money(product.price)}</span>
              {onSale && <span className="text-xs text-neutral-500 line-through">{money(product.compareAtPrice!)}</span>}
            </div>
            <div className="mt-3 flex gap-1.5">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-3.5 w-3.5 rounded-full border border-neutral-300"
                  style={{ backgroundColor: color.value }}
                />
              ))}
              {product.colors.length > 5 && <span className="text-xs text-neutral-500">+{product.colors.length - 5}</span>}
            </div>
          </div>

          {/* Touch devices have no hover: a plain add button */}
          {!soldOut && firstAvailable && defaultColor && (
            <button
              type="button"
              onClick={(event) => quickAdd(event, firstAvailable)}
              aria-label="Add to bag"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-foreground hover:text-background lg:hidden"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </Link>
    </article>
  );
}
