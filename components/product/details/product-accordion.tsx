"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";
import { ShippingInfo } from "@/components/product/shipping-info";
import { FabricDetails } from "@/components/product/fabric-details";
import { CareInstructions } from "@/components/product/care-instructions";

interface ProductAccordionProps {
  product: Product;
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  const [open, setOpen] = useState("description");

  const sections: { id: string; title: string; content: ReactNode }[] = [
    {
      id: "description",
      title: "Description",
      content: <p className="leading-8 text-neutral-600">{product.description}</p>,
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      content: <ShippingInfo />,
    },
    {
      id: "fabric",
      title: "Fabric & Material",
      content: <FabricDetails />,
    },
    {
      id: "care",
      title: "Care Instructions",
      content: <CareInstructions />,
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      content: (
        <p className="leading-8 text-neutral-600">
          Returns and exchanges are accepted within 14 days provided the
          product remains unworn and in its original condition.
        </p>
      ),
    },
  ];

  return (
    <div className="mt-20 border-t border-neutral-200">
      {sections.map((section) => {
        const isOpen = open === section.id;

        return (
          <div key={section.id} className="border-b border-neutral-200">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? "" : section.id)}
              className="flex w-full items-center justify-between py-6 text-left"
            >
              <span className="text-lg font-medium">{section.title}</span>

              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-[600px] pb-6 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="max-w-3xl">{section.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
