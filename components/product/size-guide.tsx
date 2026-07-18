"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SizeGuideProps {
  category?: "men" | "women" | "accessories";
}

const SIZE_TABLES: Record<string, { size: string; chest: string; length: string }[]> = {
  men: [
    { size: "S", chest: "96–100", length: "68" },
    { size: "M", chest: "100–104", length: "70" },
    { size: "L", chest: "104–110", length: "72" },
    { size: "XL", chest: "110–116", length: "74" },
    { size: "XXL", chest: "116–122", length: "76" },
  ],
  women: [
    { size: "XS", chest: "80–84", length: "58" },
    { size: "S", chest: "84–88", length: "60" },
    { size: "M", chest: "88–94", length: "62" },
    { size: "L", chest: "94–100", length: "64" },
  ],
  accessories: [
    { size: "ONE SIZE", chest: "—", length: "—" },
    { size: "S", chest: "—", length: "—" },
    { size: "M", chest: "—", length: "—" },
    { size: "L", chest: "—", length: "—" },
  ],
};

export function SizeGuide({ category = "men" }: SizeGuideProps) {
  const [open, setOpen] = useState(false);

  const rows = SIZE_TABLES[category] ?? SIZE_TABLES.men;

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium uppercase tracking-[0.18em] text-neutral-500 underline-offset-4 transition hover:text-black hover:underline"
      >
        Size Guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Size Guide"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Size Guide
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Measurements are in centimeters. For the best fit, we
                  recommend sizing up if you are between sizes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition hover:border-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-[0.18em] text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Size</th>
                    <th className="px-5 py-3 font-medium">Chest</th>
                    <th className="px-5 py-3 font-medium">Length</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.size}
                      className={index % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}
                    >
                      <td className="px-5 py-3 font-medium">{row.size}</td>
                      <td className="px-5 py-3 text-neutral-600">{row.chest}</td>
                      <td className="px-5 py-3 text-neutral-600">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
