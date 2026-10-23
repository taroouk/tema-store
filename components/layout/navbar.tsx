"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/icons/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/search/search-overlay";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/constants/site";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const openCart = useUiStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const header = (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-surface/85 backdrop-blur-xl">
      <Container>
        <nav
          className="grid h-20 grid-cols-3 items-center"
          aria-label="Main Navigation"
        >
          {/* Left */}
          <div className="flex items-center gap-6">
            <MobileMenu />

            <ul className="hidden items-center gap-7 lg:flex">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:text-neutral-500"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Link href="/" aria-label={siteConfig.name}>
              <Logo
                priority
                variant="black"
                width={160}
                height={48}
              />
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="transition hover:opacity-60"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative transition hover:opacity-60"
            >
              <Heart size={18} strokeWidth={1.8} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <ThemeToggle />

            <Link
              href="/track"
              aria-label="Track your order"
              title="Track your order"
              className="hidden transition hover:opacity-60 lg:flex"
            >
              <User size={18} strokeWidth={1.8} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Open shopping bag"
              className="relative transition hover:opacity-60"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />

              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </Container>
    </header>
  );

  return (
    <>
      {header}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
