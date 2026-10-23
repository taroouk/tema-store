"use client";

import { Moon, Sun } from "lucide-react";

import { setTheme, useResolvedTheme } from "@/lib/theme";

/** Light/dark switch. Renders a stable placeholder until the theme is known on the client. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useResolvedTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`flex items-center justify-center transition hover:opacity-60 ${className}`}
    >
      {theme === undefined ? <span className="h-[18px] w-[18px]" /> : dark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
    </button>
  );
}
