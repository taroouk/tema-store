import Link from "next/link";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/icons/logo";
import { getCategories } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/track" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "FAQs", href: "/faq" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Collections", href: "/collections" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLabels = {
  instagram: "Instagram",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  facebook: "Facebook",
  x: "X",
} as const;

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const shopLinks = [
    ...categories.map((c) => ({ label: c.name, href: `/${c.slug}` })),
    { label: "New Arrivals", href: "/new-in" },
  ];
  const socialLinks = Object.entries(settings.links)
    .filter(([, href]) => href)
    .map(([key, href]) => ({ href, label: socialLabels[key as keyof typeof socialLabels] }));
  const legal = [
    settings.commercialRegister && `Commercial Register: ${settings.commercialRegister}`,
    settings.taxCardNumber && `Tax Card: ${settings.taxCardNumber}`,
    settings.businessAddress,
  ].filter(Boolean);

  return (
    <footer className="border-t border-neutral-200 bg-surface">
      <Container>
        <div className="grid gap-16 py-20 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo
              variant="black"
              width={160}
              height={48}
              align="left"
            />

            <p className="mt-6 max-w-sm leading-7 text-neutral-600">
              Tema Label — the official Tema store — creates timeless everyday essentials with premium
              craftsmanship, clean aesthetics and modern simplicity.
            </p>

            <div className="mt-8 flex flex-wrap gap-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm uppercase tracking-[0.18em] text-neutral-500 transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Shop
            </h2>

            <ul className="space-y-4">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Support
            </h2>

            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">
              Company
            </h2>

            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 py-8 text-sm text-neutral-500 md:flex-row">
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} Tema Label. All rights reserved.</p>
            {legal.length > 0 && <p className="mt-1 text-xs text-neutral-500">{legal.join(" · ")}</p>}
          </div>
        </div>
      </Container>
    </footer>
  );
}