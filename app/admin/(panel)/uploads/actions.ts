"use server";

import { randomUUID } from "node:crypto";

import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "products";
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type UploadTicket =
  | { ok: true; path: string; token: string; publicUrl: string }
  | { ok: false; error: string };

/**
 * Issues a one-time signed upload URL so the browser uploads straight to Supabase Storage
 * (no server body-size limits). The bucket itself enforces mime types and max size.
 */
export async function createUploadTicket(type: string, size: number): Promise<UploadTicket> {
  await requireAdmin("catalog:write");

  const ext = TYPES[type];
  if (!ext) return { ok: false, error: "Only JPG, PNG, WebP or AVIF images are allowed." };
  if (!(size > 0) || size > MAX_BYTES) return { ok: false, error: "Image must be 5 MB or smaller." };

  const supabase = createAdminClient();
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.keys(TYPES),
  });
  if (bucketError && !/already exists|duplicate/i.test(bucketError.message)) {
    return { ok: false, error: "Storage is not available right now." };
  }

  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Could not start the upload." };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, path, token: data.token, publicUrl: pub.publicUrl };
}
