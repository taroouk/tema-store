"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/lib/forms/actions";

const field = "h-12 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-foreground";
const label = "text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, null);

  if (state?.ok) {
    return (
      <div role="status" className="rounded-3xl border border-neutral-200 p-8 text-center">
        <h2 className="text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
          Thank you.
        </h2>
        <p className="mt-3 text-neutral-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-3xl border border-neutral-200 p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className={label}>First Name</label>
          <input id="firstName" name="firstName" required autoComplete="given-name" defaultValue={state?.values?.firstName} className={field} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className={label}>Last Name</label>
          <input id="lastName" name="lastName" required autoComplete="family-name" defaultValue={state?.values?.lastName} className={field} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={label}>Email <span className="normal-case tracking-normal">(optional)</span></label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={state?.values?.email} className={field} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={label}>Phone <span className="normal-case tracking-normal">(optional)</span></label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01012345678" defaultValue={state?.values?.phone} className={field} />
        <p className="text-xs text-neutral-500">Add at least an email or a phone number so we can reply.</p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={label}>Message</label>
        <textarea id="message" name="message" rows={5} required minLength={10} maxLength={3000} defaultValue={state?.values?.message} className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-foreground" />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 size={16} className="mr-2 animate-spin" />}
        Send Message
      </Button>
    </form>
  );
}
