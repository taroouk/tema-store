"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";

interface ProductAccordionProps {
  product: Product;
}

export function ProductAccordion({
  product,
}: ProductAccordionProps) {
  const [open, setOpen] = useState("description");

  const sections = [
    {
      id: "description",
      title: "Description",
      content: product.description,
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      content:
        "Orders are processed within 24 hours and delivered within 2–4 business days across Egypt.",
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      content:
        "Returns and exchanges are accepted within 14 days provided the product remains unworn and in its original condition.",
    },
  ];

  return (
    <div className="mt-20 border-t border-neutral-200">
      {sections.map((section) => {
        const isOpen = open === section.id;

        return (
          <div
            key={section.id}
            className="border-b border-neutral-200"
          >
            <button
              type="button"
              onClick={() =>
                setOpen(isOpen ? "" : section.id)
              }
              className="flex w-full items-center justify-between py-6 text-left"
            >
              <span className="text-lg font-medium">
                {section.title}
              </span>

              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "max-h-96 pb-6 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="max-w-3xl leading-8 text-neutral-600">
                {section.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}