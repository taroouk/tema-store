"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRef } from "react";

export function MobileFilters({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 px-5 text-sm"
      >
        <SlidersHorizontal size={16} /> Filters
      </button>
      <dialog ref={dialog} className="m-0 ml-auto h-full max-h-none w-[min(90vw,22rem)] bg-surface p-0 backdrop:bg-black/50">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button type="button" aria-label="Close filters" onClick={() => dialog.current?.close()}>
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
        <div className="border-t border-neutral-200 p-4">
          <button type="button" onClick={() => dialog.current?.close()} className="h-12 w-full rounded-full bg-foreground text-sm font-semibold text-background">
            Show results
          </button>
        </div>
      </dialog>
    </div>
  );
}
