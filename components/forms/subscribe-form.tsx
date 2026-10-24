"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { subscribe } from "@/lib/forms/actions";

export function SubscribeForm() {
  const [state, action, pending] = useActionState(subscribe, null);

  return (
    <>
      <form action={action} className="mx-auto mt-12 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state?.values?.email}
          placeholder="Enter your email"
          className="h-14 flex-1 rounded-full border border-neutral-300 bg-surface px-6 text-base outline-none transition-all placeholder:text-neutral-500 focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-foreground px-8 font-medium text-background transition-all duration-300 hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? <Loader2 size={18} className="animate-spin" /> : null}
          Subscribe
          {!pending && <ArrowRight size={18} />}
        </button>
      </form>
      <p role="status" className={`mt-6 text-sm ${state ? (state.ok ? "text-green-700" : "text-red-600") : "text-neutral-500"}`}>
        {state?.message ?? "No spam. Unsubscribe anytime."}
      </p>
    </>
  );
}
