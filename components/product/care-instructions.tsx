import { InfoSection } from "@/components/product/info-section";

export function CareInstructions() {
  return (
    <InfoSection title="Care Instructions">
      <ul className="list-disc space-y-1 pl-5">
        <li>Machine wash cold with like colors</li>
        <li>Use mild detergent, do not bleach</li>
        <li>Tumble dry low or lay flat to dry</li>
        <li>Iron on low heat if needed</li>
        <li>Do not dry clean</li>
      </ul>
    </InfoSection>
  );
}
