"use client";

import { Check, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { createUploadTicket } from "@/app/admin/(panel)/uploads/actions";
import { createClient } from "@/lib/supabase/client";

/**
 * One-image picker. The photo uploads straight to storage and then shows right where the upload box was,
 * with a note that it still needs Save. The public URL is submitted through a hidden field.
 */
export function ImageField({
  name,
  defaultValue = "",
  form,
  label = "Upload photo",
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
  const unsaved = url !== defaultValue;

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
      toast.success("Photo uploaded — press Save to keep it");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="w-44">
      <input type="hidden" name={name} value={url} form={form} />
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files?.[0])} />

      {url ? (
        <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100">
          <Image src={url} alt="" fill sizes="176px" className="object-cover" unoptimized />
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Loader2 size={20} className="animate-spin" />
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1.5 py-1">
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="px-1 text-xs text-white hover:underline">
              Change
            </button>
            <button type="button" onClick={() => setUrl("")} aria-label="Remove photo" className="p-0.5 text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          {busy ? "Uploading…" : label}
        </button>
      )}

      {unsaved && !busy && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
          <Check size={12} /> {url ? "Uploaded — press Save" : "Removed — press Save"}
        </p>
      )}
    </div>
  );
}
