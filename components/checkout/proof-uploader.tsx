"use client";

import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { attachPaymentProof, createProofTicket } from "@/app/checkout/payment-actions";
import { createClient } from "@/lib/supabase/client";

/** Lets a customer attach a screenshot of their transfer to an existing order. */
export function ProofUploader({ number, email, compact = false }: { number: number; email: string; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(null);
    setState("uploading");
    try {
      const ref = { number, email };
      const ticket = await createProofTicket(ref, file.type, file.size);
      if (!ticket.ok) throw new Error(ticket.error);

      const { error: uploadError } = await createClient()
        .storage.from("payment-proofs")
        .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (uploadError) throw new Error("Upload failed. Please try again.");

      const attached = await attachPaymentProof(ref, ticket.path);
      if (!attached.ok) throw new Error(attached.error ?? "Could not attach the screenshot.");
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
      setState("idle");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="flex items-center justify-center gap-2 text-sm font-medium text-green-700">
        <CheckCircle2 size={18} /> Screenshot received — thank you.
      </p>
    );
  }

  return (
    <div className={compact ? "" : "mt-2"}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={state === "uploading"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 text-sm font-medium transition hover:border-foreground disabled:opacity-60"
      >
        {state === "uploading" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {state === "uploading" ? "Uploading…" : "Upload payment screenshot"}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
