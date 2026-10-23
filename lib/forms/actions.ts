"use server";

import { after } from "next/server";
import { z } from "zod";

import { notifyWelcome } from "@/lib/notify";

import { prisma } from "@/lib/prisma/client";
import { rateLimit } from "@/lib/rate-limit";

/** `values` echoes the submitted fields on errors: React clears uncontrolled forms after an action. */
export type FormState = { ok: boolean; message: string; values?: Record<string, string> } | null;

const pick = (formData: FormData, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));

const Subscribe = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  website: z.string().max(0).optional(), // honeypot
});

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const r = Subscribe.safeParse({ email: formData.get("email"), website: formData.get("website") ?? "" });
  const values = pick(formData, ["email"]);
  if (!r.success) return { ok: false, message: r.error.issues[0].message, values };
  if (!(await rateLimit("subscribe", 5, 10 * 60_000))) return { ok: false, message: "Too many attempts. Try again later.", values };

  const existing = await prisma.subscriber.findUnique({ where: { email: r.data.email } });
  await prisma.subscriber.upsert({
    where: { email: r.data.email },
    update: { isActive: true },
    create: { email: r.data.email },
  });
  if (!existing?.isActive) after(() => notifyWelcome(r.data.email).catch((e) => console.error("[notify] welcome", e)));
  return { ok: true, message: "Thanks for subscribing — welcome to Tema Label." };
}

const Contact = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  message: z.string().trim().min(10, "Message is too short").max(3000, "Message is too long"),
  website: z.string().max(0).optional(),
});

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const r = Contact.safeParse({
    name: `${formData.get("firstName") ?? ""} ${formData.get("lastName") ?? ""}`,
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
  const values = pick(formData, ["firstName", "lastName", "email", "message"]);
  if (!r.success) return { ok: false, message: r.error.issues[0].message, values };
  if (!(await rateLimit("contact", 3, 10 * 60_000))) return { ok: false, message: "Too many messages. Please try again later.", values };

  const { website: _website, ...data } = r.data;
  void _website;
  await prisma.contactMessage.create({ data });
  return { ok: true, message: "Message sent. We'll get back to you within 1–2 business days." };
}

const Track = z.object({
  number: z.coerce.number().int().positive().max(2_000_000_000),
  email: z.string().trim().toLowerCase().email().max(200),
});

export type TrackState = { error?: string; order?: TrackedOrder; values?: Record<string, string> } | null;

export type TrackedOrder = {
  number: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  email: string;
  createdAt: string;
  total: number;
  currency: string;
  items: { name: string; color: string; size: string; quantity: number }[];
};

export async function trackOrder(
  _prev: TrackState,
  formData: FormData
): Promise<NonNullable<TrackState>> {
  const values = pick(formData, ["number", "email"]);
  const r = Track.safeParse({ number: String(formData.get("number") ?? "").replace(/^#/, ""), email: formData.get("email") });
  if (!r.success) return { error: "Enter your order number and the email used at checkout.", values };
  if (!(await rateLimit("track", 10, 10 * 60_000))) return { error: "Too many attempts. Please try again later.", values };

  const order = await prisma.order.findFirst({
    where: { number: r.data.number, email: r.data.email },
    include: { items: true },
  });
  // Same message whether the number or the email was wrong, so orders can't be enumerated.
  if (!order) return { error: "We couldn't find an order matching those details.", values };

  return {
    order: {
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      email: order.email,
      createdAt: order.createdAt.toISOString(),
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map((i) => ({ name: i.name, color: i.color, size: i.size, quantity: i.quantity })),
    },
  };
}
