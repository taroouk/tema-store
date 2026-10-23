"use client";

import { Printer } from "lucide-react";

import { btnGhostCls } from "./ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={`${btnGhostCls} no-print gap-2`}>
      <Printer size={14} /> Print
    </button>
  );
}
