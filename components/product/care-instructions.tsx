import { InfoSection } from "@/components/product/info-section";

/** Care steps come from the product itself (Admin → Products → Care instructions), one per line. */
export function CareInstructions({ care }: { care: string }) {
  const lines = care.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  return (
    <InfoSection title="Care Instructions">
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
