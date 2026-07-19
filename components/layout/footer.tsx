import Link from "next/link";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/icons/logo";

const shopLinks = [
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Accessories", href: "/accessories" },
  { label: "New Arrivals", href: "/new-in" },
];

const supportLinks = [
  { label: "Contact Us", href: "/checkout" },
  { label: "Shipping", href: "/collections" },
  { label: "Returns", href: "/wishlist" },
  { label: "FAQs", href: "/" },
];

const companyLinks = [
  { label: "About", href: "/new-in" },
  { label: "Journal", href: "/collections" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  {
    href: "https://instagram.com",
    label: "Instagram",
  },
  {
    href: "https://tiktok.com",
    label: "TikTok",
  },
  {
    href: "https://pinterest.com",
    label: "Pinterest",
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container>
        <div className="grid gap-16 py-20 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo
              variant="black"
              width={160}
              height={48}
            />

            <p className="mt-6 max-w-sm leading-7 text-neutral-600">
              TEMA creates timeless everyday essentials with premium
              craftsmanship, clean aesthetics and modern simplicity.
            </p>

            <div className="mt-8 flex flex-wrap gap-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm uppercase tracking-[0.18em] text-neutral-500 transition hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Shop
            </h3>

            <ul className="space-y-4">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Support
            </h3>

            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Company
            </h3>

            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 py-8 text-sm text-neutral-500 md:flex-row">
          <p>© 2026 TEMA. All rights reserved.</p>

          <p>Designed & Developed by TEMA.</p>
        </div>
      </Container>
    </footer>
  );
}