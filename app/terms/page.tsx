import { LegalPage, legalMetadata } from "@/components/content/legal-page";

export const generateMetadata = () => legalMetadata("terms");

export default function Page() {
  return <LegalPage slug="terms" eyebrow="Legal" />;
}
