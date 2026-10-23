"use client";

import { useSyncExternalStore } from "react";

export type ResolvedTheme = "light" | "dark";
const KEY = "theme";

/**
 * Tiny theme store. The initial class is set by the inline script in the root layout (no flash);
 * this reads the live <html> class so components always agree with what is on screen.
 */
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

export function useResolvedTheme(): ResolvedTheme | undefined {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => undefined
  );
}

export function setTheme(theme: ResolvedTheme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Script source run before first paint. Follows the OS until the visitor picks a theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
