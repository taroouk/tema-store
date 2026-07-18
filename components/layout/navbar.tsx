"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/icons/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { siteConfig } from "@/constants/site";
import { useCartStore } from "@/stores/cart-store";

export function Navbar() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <Container>
        <nav
          className="grid h-20 grid-cols-3 items-center"
          aria-label="Main Navigation"
        >
          {/* Left */}
          <div className="flex items-center gap-6">
            <MobileMenu />

            <ul className="hidden items-center gap-6 lg:flex">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:text-neutral-500"
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
              className="hidden transition hover:opacity-60 lg:flex"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="Account"
              className="hidden transition hover:opacity-60 lg:flex"
            >
              <User size={18} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              className="hidden transition hover:opacity-60 lg:flex"
            >
              <Heart size={18} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label="Shopping Bag"
              className="relative hidden transition hover:opacity-60 lg:flex"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />

              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </Container>
    </header>
  );
}