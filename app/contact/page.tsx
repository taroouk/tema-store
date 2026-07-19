import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the TEMA team — contact details, store hours, and support.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | TEMA",
    description: "Get in touch with the TEMA team.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

export default function ContactPage() {
  return (
    <Section className="py-16">
      <Container>
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Support
          </span>

          <h1
            className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Contact Us
          </h1>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Questions about an order, a product, or anything else? Our team is
            here to help.
          </p>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          {/* Details */}

          <div className="space-y-10">
            <div className="flex gap-4">
              <Mail size={22} className="mt-1 shrink-0 text-neutral-900" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Email
                </h2>
                <p className="mt-2 text-neutral-600">support@tema.com</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone size={22} className="mt-1 shrink-0 text-neutral-900" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Phone
                </h2>
                <p className="mt-2 text-neutral-600">+20 100 000 0000</p>
              </div>
            </div>

            <div className="flex gap-4">
              <MapPin size={22} className="mt-1 shrink-0 text-neutral-900" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Studio
                </h2>
                <p className="mt-2 text-neutral-600">
                  TEMA Studio, Cairo, Egypt
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                Store Hours
              </h2>
              <ul className="mt-3 space-y-2 text-neutral-600">
                <li className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span>10:00 – 20:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span>12:00 – 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                Social
              </h2>
              <div className="mt-3 flex flex-wrap gap-6">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-[0.18em] text-neutral-500 transition hover:text-black"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form (UI only) */}

          <form
            className="space-y-5 rounded-3xl border border-neutral-200 p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="firstName"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  className="h-12 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lastName"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  className="h-12 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="h-12 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Send Message
            </Button>

            <p className="text-center text-xs text-neutral-400">
              This is a demo form. No message is sent.
            </p>
          </form>
        </div>
      </Container>
    </Section>
  );
}
