"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/icons/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useCatalog } from "@/components/catalog/catalog-provider";
import { ShopDropdown } from "@/components/layout/shop-dropdown";
import { siteConfig } from "@/constants/site";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const SearchOverlay = dynamic(() => import("@/components/search/search-overlay").then((m) => m.SearchOverlay), { ssr: false });

export function Navbar() {
  const products = useCatalog();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchUsed, setSearchUsed] = useState(false);

  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const openCart = useUiStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const header = (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-surface/85 backdrop-blur-xl">
      <Container>
        <nav
          className="grid h-14 grid-cols-3 items-center"
          aria-label="Main Navigation"
        >
          {/* Left */}
          <div className="flex items-center gap-6">
            <MobileMenu />

            <ul className="hidden items-center gap-6 lg:flex">
              <ShopDropdown />
              {products.length > 0 && (
                <li>
                  <Link
                    href="/new-in"
                    className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:text-neutral-500"
                  >
                    New In
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Link href="/" aria-label={siteConfig.name}>
              <Logo
                priority
                variant="black"
                width={118}
                height={34}
              />
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearchUsed(true);
                setSearchOpen(true);
              }}
              className="-m-2 p-2 transition hover:opacity-60"
            >
              <Search size={17} strokeWidth={1.8} />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative -m-2 p-2 transition hover:opacity-60"
            >
              <Heart size={17} strokeWidth={1.8} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <ThemeToggle className="-m-2 p-2" />

            <Link
              href="/track"
              aria-label="Track your order"
              title="Track your order"
              className="-m-2 hidden p-2 transition hover:opacity-60 lg:flex"
            >
              <User size={17} strokeWidth={1.8} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Open shopping bag"
              className="relative -m-2 p-2 transition hover:opacity-60"
            >
              <ShoppingBag size={17} strokeWidth={1.8} />

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
      {searchUsed && <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
