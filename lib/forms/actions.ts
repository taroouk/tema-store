"use server";

import { after } from "next/server";
import { z } from "zod";

import { notifyWelcome } from "@/lib/notify";

import { normalizeEgyptianPhone } from "@/lib/egypt";
import { findOrderByContact } from "@/lib/orders/lookup";
import { publishAdminEvent } from "@/lib/realtime";
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
  if (!existing?.isActive)
    after(() => publishAdminEvent({ type: "subscriber.new", scope: "marketing", title: "New subscriber", body: r.data.email, href: "/admin/subscribers" }));
  if (!existing?.isActive) after(() => notifyWelcome(r.data.email).catch((e) => console.error("[notify] welcome", e)));
  return { ok: true, message: "Thanks for subscribing — welcome to Tema Label." };
}

const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const Contact = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(100),
    // Email and phone are each optional, but we need at least one way to reply.
    email: z.preprocess(blankToUndefined, z.string().trim().toLowerCase().email("Enter a valid email address").max(200).optional()),
    phone: z.preprocess(
      blankToUndefined,
      z.string().trim().max(30).refine((v) => normalizeEgyptianPhone(v) !== null, "Enter a valid Egyptian phone number (e.g. 01012345678)").optional()
    ),
    message: z.string().trim().min(10, "Message is too short").max(3000, "Message is too long"),
    website: z.string().max(0).optional(),
  })
  .refine((d) => d.email || d.phone, { message: "Add an email or a phone number so we can reply", path: ["email"] });

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const r = Contact.safeParse({
    name: `${formData.get("firstName") ?? ""} ${formData.get("lastName") ?? ""}`,
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
  const values = pick(formData, ["firstName", "lastName", "email", "phone", "message"]);
  if (!r.success) return { ok: false, message: r.error.issues[0].message, values };
  if (!(await rateLimit("contact", 3, 10 * 60_000))) return { ok: false, message: "Too many messages. Please try again later.", values };

  const { website: _website, phone, ...data } = r.data;
  void _website;
  await prisma.contactMessage.create({ data: { ...data, phone: phone ? normalizeEgyptianPhone(phone) : undefined } });
  after(() =>
    publishAdminEvent({
      type: "message.new",
      scope: "customers",
      title: `New message from ${data.name}`,
      body: data.message.slice(0, 120),
      href: "/admin/messages",
    })
  );
  return { ok: true, message: "Message sent. We'll get back to you within 1–2 business days." };
}

const Track = z.object({
  number: z.coerce.number().int().positive().max(2_000_000_000),
  contact: z.string().trim().min(3).max(200),
});

export type TrackState = { error?: string; order?: TrackedOrder; values?: Record<string, string> } | null;

export type TrackedOrder = {
  number: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  /** The email or phone the customer entered (used for the screenshot upload). */
  contact: string;
  createdAt: string;
  total: number;
  currency: string;
  items: { name: string; color: string; size: string; quantity: number }[];
};

export async function trackOrder(
  _prev: TrackState,
  formData: FormData
): Promise<NonNullable<TrackState>> {
  const values = pick(formData, ["number", "contact"]);
  const r = Track.safeParse({ number: String(formData.get("number") ?? "").replace(/^#/, ""), contact: formData.get("contact") });
  if (!r.success) return { error: "Enter your order number and the phone number or email you used at checkout.", values };
  if (!(await rateLimit("track", 10, 10 * 60_000))) return { error: "Too many attempts. Please try again later.", values };

  const order = await findOrderByContact(r.data.number, r.data.contact);
  // Same message whether the number or the contact was wrong, so orders can't be enumerated.
  if (!order) return { error: "We couldn't find an order matching those details.", values };

  return {
    order: {
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      contact: r.data.contact,
      createdAt: order.createdAt.toISOString(),
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map((i) => ({ name: i.name, color: i.color, size: i.size, quantity: i.quantity })),
    },
  };
}
