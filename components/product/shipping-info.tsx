"use client";

import { usePricing } from "@/components/catalog/catalog-provider";
import { InfoSection } from "@/components/product/info-section";

export function ShippingInfo() {
  const { freeShippingThreshold, expressShippingFee } = usePricing();

  return (
    <InfoSection title="Shipping & Delivery">
      <p>
        Orders are processed within 24 hours and delivered within 2–4
        business days across Egypt.
      </p>
      <p>
        Free standard shipping on all orders above EGP{" "}
        {freeShippingThreshold.toLocaleString("en-US")}. Express delivery is
        available at checkout for EGP {expressShippingFee.toLocaleString("en-US")}.
      </p>
    </InfoSection>
  );
}
