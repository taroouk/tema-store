"use client";

import { useEffect, useState } from "react";

import { MailIcon, SOCIAL_COLORS, SOCIAL_ICONS, SOCIAL_LABELS, type SocialKey } from "@/components/icons/social-icons";

/** Floating side dock: social links + email, follows the page while scrolling. */
export function SocialDock({ links, email }: { links: Partial<Record<SocialKey, string>>; email?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    ...(Object.keys(SOCIAL_ICONS) as SocialKey[])
      .filter((k) => links[k])
      .map((k) => ({ key: k, label: SOCIAL_LABELS[k], href: links[k]!, Icon: SOCIAL_ICONS[k], external: true })),
    ...(email ? [{ key: "mail" as const, label: "Email us", href: `mailto:${email}`, Icon: MailIcon, external: false }] : []),
  ];
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Contact and social links"
      className={`fixed right-3 top-1/2 z-40 -translate-y-1/2 transition-all duration-500 sm:right-5 ${
        shown ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      <ul className="flex flex-col gap-2 rounded-full border border-neutral-300/70 bg-background/80 p-1.5 shadow-lg backdrop-blur-md">
        {items.map(({ key, label, href, Icon, external }) => (
          <li key={key}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={label}
              title={label}
              style={{ color: key === "mail" ? "var(--foreground)" : SOCIAL_COLORS[key] }}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-110 hover:bg-neutral-500/15 sm:h-11 sm:w-11"
            >
              <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background opacity-0 transition group-hover:opacity-100 sm:block">
                {label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
