"use client";

import { priceForSize } from "@/lib/size-price";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useCatalog, usePricing } from "@/components/catalog/catalog-provider";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";

/** Slide-over mini cart. Opens whenever something is added to the bag or the bag icon is clicked. */
export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const close = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const remove = useCartStore((s) => s.removeItem);
  const products = useCatalog();
  const { freeShippingThreshold } = usePricing();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const lines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { item, product } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((n, l) => n + priceForSize(l.product, l.item.size) * l.item.quantity, 0);
  const count = lines.reduce((n, l) => n + l.item.quantity, 0);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <motion.button
            aria-label="Close bag"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface text-foreground shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
              <h2 className="text-lg font-semibold">
                Your bag <span className="text-neutral-500">({count})</span>
              </h2>
              <button onClick={close} aria-label="Close bag" className="rounded-full p-2 transition hover:bg-neutral-100">
                <X size={20} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <ShoppingBag size={40} strokeWidth={1.2} className="text-neutral-500" />
                <p className="text-lg font-medium">Your bag is empty</p>
                <p className="text-sm text-neutral-500">Add a piece you love and it will show up here.</p>
                <Link
                  href="/new-in"
                  onClick={close}
                  className="mt-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:opacity-90"
                >
                  Shop New In
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-neutral-200 px-6 py-4 text-sm">
                  <p>
                    {remaining > 0 ? (
                      <>
                        Add <strong>EGP {remaining.toLocaleString("en-US")}</strong> more for free shipping
                      </>
                    ) : (
                      <strong>You&apos;ve unlocked free shipping 🎉</strong>
                    )}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-6">
                  {lines.map(({ item, product }) => {
                    const color = product.colors.find((c) => c.id === item.colorId);
                    const image = product.images[0];
                    return (
                      <li key={`${item.productId}-${item.colorId}-${item.size}`} className="flex gap-4 py-5">
                        <Link href={`/products/${product.slug}`} onClick={close} className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                          {image && <Image src={image.src} alt={image.alt} fill sizes="88px" className="object-cover" />}
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex justify-between gap-3">
                            <div>
                              <Link href={`/products/${product.slug}`} onClick={close} className="text-sm font-medium hover:underline">
                                {product.name}
                              </Link>
                              <p className="mt-1 text-xs text-neutral-500">
                                {color?.name ?? item.colorId} · {item.size}
                              </p>
                            </div>
                            <p className="text-sm font-medium">EGP {(priceForSize(product, item.size) * item.quantity).toLocaleString("en-US")}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-neutral-300">
                              <button aria-label="Decrease quantity" onClick={() => decrease(item.productId, item.colorId, item.size)} className="flex h-8 w-8 items-center justify-center">
                                <Minus size={14} />
                              </button>
                              <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                              <button aria-label="Increase quantity" onClick={() => increase(item.productId, item.colorId, item.size)} className="flex h-8 w-8 items-center justify-center">
                                <Plus size={14} />
                              </button>
                            </div>
                            <button aria-label="Remove item" onClick={() => remove(item.productId, item.colorId, item.size)} className="text-neutral-500 transition hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <footer className="space-y-3 border-t border-neutral-200 px-6 py-5">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Subtotal</span>
                    <span>EGP {subtotal.toLocaleString("en-US")}</span>
                  </div>
                  <p className="text-xs text-neutral-500">Shipping and discounts are calculated at checkout.</p>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex h-14 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-[0.18em] text-background transition hover:opacity-90"
                  >
                    Checkout
                  </Link>
                  <Link href="/cart" onClick={close} className="block text-center text-sm text-neutral-500 underline-offset-4 hover:underline">
                    View full bag
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
