"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const PROOF_BUCKET = "payment-proofs";
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const Ref = z.object({
  number: z.coerce.number().int().positive().max(2_000_000_000),
  email: z.string().trim().toLowerCase().email().max(200),
});

/** The order number + checkout email together act as the customer's proof of ownership. */
async function findTransferOrder(input: unknown) {
  const ref = Ref.safeParse(input);
  if (!ref.success) return null;
  const order = await prisma.order.findFirst({
    where: { number: ref.data.number, email: ref.data.email, paymentMethod: { in: ["INSTAPAY", "WALLET"] } },
    select: { id: true, paymentStatus: true },
  });
  if (!order || order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") return null;
  return order;
}

export type ProofTicket =
  | { ok: true; path: string; token: string }
  | { ok: false; error: string };

/** One-time signed upload URL into a private bucket (the browser uploads directly to storage). */
export async function createProofTicket(input: { number: number; email: string }, type: string, size: number): Promise<ProofTicket> {
  if (!(await rateLimit("proof", 10, 10 * 60_000))) return { ok: false, error: "Too many uploads. Please try again later." };

  const ext = TYPES[type];
  if (!ext) return { ok: false, error: "Upload a JPG, PNG or WebP screenshot." };
  if (!(size > 0) || size > MAX_BYTES) return { ok: false, error: "The image must be 5 MB or smaller." };

  const order = await findTransferOrder(input);
  if (!order) return { ok: false, error: "We couldn't find a transfer order matching those details." };

  const supabase = createAdminClient();
  const { error: bucketError } = await supabase.storage.createBucket(PROOF_BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.keys(TYPES),
  });
  if (bucketError && !/already exists|duplicate/i.test(bucketError.message)) {
    return { ok: false, error: "Uploads are not available right now." };
  }

  const path = `orders/${order.id}/${randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Could not start the upload." };
  return { ok: true, path, token: data.token };
}

export async function attachPaymentProof(input: { number: number; email: string }, path: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await rateLimit("proof-attach", 10, 10 * 60_000))) return { ok: false, error: "Too many attempts." };

  const order = await findTransferOrder(input);
  // The path must live under this order's own folder, so nobody can attach someone else's file.
  if (!order || typeof path !== "string" || !path.startsWith(`orders/${order.id}/`) || path.includes("..")) {
    return { ok: false, error: "We couldn't attach that file to your order." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentProof: path, paymentStatus: "AWAITING_VERIFICATION" },
  });
  revalidatePath("/admin/orders");
  return { ok: true };
}
