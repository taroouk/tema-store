import { LegalPage, legalMetadata } from "@/components/content/legal-page";

export const generateMetadata = () => legalMetadata("returns");

export default function Page() {
  return <LegalPage slug="returns" eyebrow="Support" />;
}
