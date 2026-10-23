import { LegalPage, legalMetadata } from "@/components/content/legal-page";

export const generateMetadata = () => legalMetadata("privacy");

export default function Page() {
  return <LegalPage slug="privacy" eyebrow="Legal" />;
}
