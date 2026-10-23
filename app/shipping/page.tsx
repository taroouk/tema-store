import { LegalPage, legalMetadata } from "@/components/content/legal-page";

export const generateMetadata = () => legalMetadata("shipping");

export default function Page() {
  return <LegalPage slug="shipping" eyebrow="Delivery" />;
}
