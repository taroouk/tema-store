"use client";

import { btnCls } from "@/components/admin/ui";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-neutral-200 bg-white p-8 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-500">
        The page could not be loaded. {error.digest && <span className="font-mono text-xs">Ref: {error.digest}</span>}
      </p>
      <button onClick={reset} className={`${btnCls} mt-6`}>
        Try again
      </button>
    </div>
  );
}
