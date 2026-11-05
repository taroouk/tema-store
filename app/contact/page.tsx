import { SocialLinks } from "@/components/common/social-links";
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/constants/site";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Tema Label team — contact details, store hours, and support.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Tema Label",
    description: "Get in touch with the Tema Label team.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const hasSocials = Object.values(settings.links).some(Boolean);

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
                <p className="mt-2 text-neutral-600">
                  {settings.supportEmail ? <a href={`mailto:${settings.supportEmail}`} className="hover:underline">{settings.supportEmail}</a> : "Use the form and we will reply by email."}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone size={22} className="mt-1 shrink-0 text-neutral-900" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Phone
                </h2>
                <p className="mt-2 text-neutral-600">{settings.supportPhone || "Available soon"}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <MapPin size={22} className="mt-1 shrink-0 text-neutral-900" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Studio
                </h2>
                <p className="mt-2 text-neutral-600">
                  {settings.businessAddress || "Egypt"}
                </p>
              </div>
            </div>

            {settings.storeHours && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Store Hours</h2>
                <ul className="mt-3 space-y-2 text-neutral-600">
                  {settings.storeHours
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const i = line.indexOf(": ");
                      const [day, hours] = i > 0 ? [line.slice(0, i), line.slice(i + 2).trim()] : [line, ""];
                      return (
                        <li key={line} className="flex justify-between gap-4">
                          <span>{day}</span>
                          <span>{hours}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}

            {hasSocials && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">
                Social
              </h2>
              <SocialLinks links={settings.links} className="mt-3" />
            </div>
            )}
          </div>

          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}
