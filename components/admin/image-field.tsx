"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { createUploadTicket } from "@/app/admin/(panel)/uploads/actions";
import { createClient } from "@/lib/supabase/client";

/** One-image picker that uploads straight to storage and submits the public URL as a hidden field. */
export function ImageField({
  name,
  defaultValue = "",
  form,
  label = "Photo",
}: {
  name: string;
  defaultValue?: string;
  /** id of a <form> elsewhere in the page (used inside table rows). */
  form?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const ticket = await createUploadTicket(file.type, file.size);
      if (!ticket.ok) return void toast.error(ticket.error);
      const { error } = await createClient()
        .storage.from("products")
        .uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (error) return void toast.error("Upload failed");
      setUrl(ticket.publicUrl);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={url} form={form} />
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100">
        {url ? <Image src={url} alt="" fill sizes="56px" className="object-cover" unoptimized /> : null}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 size={16} className="animate-spin" />
          </span>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-50"
      >
        <ImagePlus size={14} /> {url ? "Change" : label}
      </button>
      {url && (
        <button type="button" onClick={() => setUrl("")} aria-label="Remove photo" className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
