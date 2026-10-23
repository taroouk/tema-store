"use client";

import { useActionState } from "react";

import { unsubscribe } from "./actions";

export function UnsubscribeForm({ email, token }: { email: string; token: string }) {
  const [state, action, pending] = useActionState(async (_prev: { ok: boolean } | null, fd: FormData) => unsubscribe(fd), null);

  if (state?.ok) return <p role="status" className="mt-6 text-green-700">You&apos;re unsubscribed. We won&apos;t email you again.</p>;

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="e" value={email} />
      <input type="hidden" name="t" value={token} />
      {state && !state.ok && <p role="alert" className="mb-3 text-sm text-red-600">That link is not valid.</p>}
      <button disabled={pending} className="rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background disabled:opacity-60">
        {pending ? "Working…" : "Confirm unsubscribe"}
      </button>
    </form>
  );
}
