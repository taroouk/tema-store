import type { ReactNode } from "react";

/**
 * Soft fade-in for page content. Pure CSS (see .animate-page-in), so the server-rendered HTML is
 * visible immediately — no waiting for JavaScript to hydrate before anything shows.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <main id="main-content" tabIndex={-1} className="animate-page-in outline-none">
      {children}
    </main>;
}
