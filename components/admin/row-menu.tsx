"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * "⋯" actions menu for table rows. The panel is `position: fixed`, so the table's scroll container
 * can't clip it, and it flips upward near the bottom of the screen. Its children stay inside the
 * surrounding <form>, so submit buttons and confirm dialogs keep working.
 */
export function RowMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  function toggle() {
    if (!open && button.current) {
      const r = button.current.getBoundingClientRect();
      const right = Math.max(8, window.innerWidth - r.right);
      // Menus are ~220px tall; open upward when there isn't room below.
      setPos(window.innerHeight - r.bottom < 260 ? { bottom: window.innerHeight - r.top + 6, right } : { top: r.bottom + 6, right });
    }
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <div ref={root} className="relative inline-block text-left">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-neutral-100 ${open ? "bg-neutral-100" : ""}`}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
          className="fixed z-50 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1.5 shadow-2xl"
        >
          {children}
        </div>
      )}
    </div>
  );
}
