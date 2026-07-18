import { InfoSection } from "@/components/product/info-section";

interface FabricDetailsProps {
  composition?: string;
  weight?: string;
}

export function FabricDetails({
  composition = "100% Premium Combed Cotton",
  weight = "240 GSM Heavyweight",
}: FabricDetailsProps) {
  return (
    <InfoSection title="Fabric & Material">
      <p>
        Crafted from {composition.toLowerCase()}, our fabric is chosen for
        its durability, breathability, and soft hand feel.
      </p>
      <p>
        Woven at {weight} for a structured yet comfortable drape that holds
        its shape wash after wash.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Pre-shrunk to minimize shrinkage</li>
        <li>Reinforced seams for everyday wear</li>
        <li>OEKO-TEX certified, low-impact dyes</li>
      </ul>
    </InfoSection>
  );
}
