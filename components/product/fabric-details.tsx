import { InfoSection } from "@/components/product/info-section";

/** Material text comes from the product itself (Admin → Products → Material). */
export function FabricDetails({ material }: { material: string }) {
  const lines = material.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  return (
    <InfoSection title="Fabric & Material">
      {lines.length === 1 ? (
        <p>{lines[0]}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </InfoSection>
  );
}
