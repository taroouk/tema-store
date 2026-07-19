import { siteConfig } from "@/constants/site";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white">
      <span
        className="text-2xl font-semibold uppercase tracking-[0.4em]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {siteConfig.name}
      </span>

      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full ux-loading-bar" />

      <span className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-400">
        Loading
      </span>
    </div>
  );
}
