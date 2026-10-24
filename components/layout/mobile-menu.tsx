"use client";

import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const Panel = dynamic(() => import("./mobile-menu-panel"), { ssr: false });

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  // Mount the panel on first open and keep it mounted so its exit animation can play.
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => {
          setEverOpened(true);
          setOpen((prev) => !prev);
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-100 lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {everOpened && <Panel open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
