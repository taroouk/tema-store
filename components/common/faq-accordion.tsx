"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("divide-y divide-neutral-200 border-y border-neutral-200", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-6 text-left"
            >
              <span className="text-lg font-medium">{item.question}</span>

              <ChevronDown
                size={20}
                className={cn(
                  "shrink-0 text-neutral-500 transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="max-w-3xl leading-8 text-neutral-600">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
