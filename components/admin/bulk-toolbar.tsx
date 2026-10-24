"use client";

import { useEffect, useState } from "react";

/**
 * Sticky bar for table selections. Row checkboxes are plain `<input name="ids">` inside the form;
 * this only counts them, offers select-all, and shows the action buttons (passed as children) when needed.
 */
export function BulkToolbar({ formId, children }: { formId: string; children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const boxes = () => [...form.querySelectorAll<HTMLInputElement>('input[name="ids"]')];
    const recount = () => {
      const all = boxes();
      setTotal(all.length);
      setCount(all.filter((b) => b.checked).length);
    };
    recount();
    form.addEventListener("change", recount);
    return () => form.removeEventListener("change", recount);
  }, [formId]);

  const toggleAll = (checked: boolean) => {
    const form = document.getElementById(formId);
    form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((b) => (b.checked = checked));
    form?.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div className="sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm shadow-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          aria-label="Select all products on this page"
          checked={total > 0 && count === total}
          ref={(el) => {
            if (el) el.indeterminate = count > 0 && count < total;
          }}
          onChange={(e) => toggleAll(e.target.checked)}
        />
        <span className="text-neutral-600">{count > 0 ? `${count} selected` : "Select all"}</span>
      </label>
      <div className={`flex flex-wrap items-center gap-2 ${count === 0 ? "pointer-events-none opacity-40" : ""}`} aria-disabled={count === 0}>
        {children}
      </div>
    </div>
  );
}
