import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "TEMA shipping regions, delivery times, costs, and order tracking explained.",
  alternates: { canonical: "/shipping" },
  openGraph: {
    title: "Shipping | TEMA",
    description: "Delivery regions, times, costs, and tracking.",
    url: `${siteConfig.url}/shipping`,
    siteName: siteConfig.name,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
};

const regions = [
  { region: "Cairo & Giza", time: "1–2 business days", cost: "EGP 80" },
  { region: "Alexandria", time: "2–3 business days", cost: "EGP 80" },
  { region: "Other Governorates", time: "3–4 business days", cost: "EGP 80" },
  { region: "Orders over EGP 1,500", time: "2–4 business days", cost: "Free" },
];

export default function ShippingPage() {
  return (
    <Section className="py-16">
      <Container>
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Delivery
          </span>

          <h1
            className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Shipping & Delivery
          </h1>

          <p className="mt-6 text-lg leading-8 text-neutral-600">
            We deliver across Egypt with care. Free standard shipping is
            available on all orders above EGP 1,500.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Delivery Regions & Times
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Region</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((row) => (
                    <tr key={row.region} className="border-t border-neutral-200">
                      <td className="px-5 py-4 font-medium">{row.region}</td>
                      <td className="px-5 py-4 text-neutral-600">{row.time}</td>
                      <td className="px-5 py-4 text-neutral-600">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Shipping Cost
              </h2>
              <p className="mt-4 leading-8 text-neutral-600">
                A flat rate of EGP 80 applies to standard deliveries. Orders
                totaling EGP 1,500 or more ship free. Express delivery is
                available at checkout for an additional fee.
              </p>
            </div>

            <div>
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Tracking
              </h2>
              <p className="mt-4 leading-8 text-neutral-600">
                As soon as your order leaves our studio, you will receive a
                tracking link by email so you can follow your parcel until it
                arrives.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
