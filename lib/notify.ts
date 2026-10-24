import "server-only";

import { siteConfig } from "@/constants/site";
import { signToken } from "@/lib/tokens";

/**
 * Outbound notifications. Everything here is best-effort: a failing provider must never break an order.
 *
 *  - Email via Resend:  RESEND_API_KEY, EMAIL_FROM ("Tema Label <orders@temalabel.com>")
 *  - Owner alerts:      ORDER_NOTIFY_EMAIL (falls back to the support email) and/or
 *                       TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (instant phone alert)
 * Without credentials the calls are no-ops that log a single line.
 */

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const egp = (n: number) => `EGP ${Number(n).toLocaleString("en-US")}`;

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.info(`[notify] email skipped (RESEND_API_KEY/EMAIL_FROM not set): "${opts.subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[notify] email failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[notify] email error", e);
    return false;
  }
}

export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (e) {
    console.error("[notify] telegram error", e);
    return false;
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;padding:32px">
  <tr><td><p style="margin:0 0 24px;font-size:18px;letter-spacing:3px;font-weight:700">${esc(siteConfig.name.toUpperCase())}</p>
  <h1 style="margin:0 0 16px;font-size:22px">${esc(title)}</h1>${body}
  <p style="margin:32px 0 0;font-size:12px;color:#777">${esc(siteConfig.name)} · <a href="${siteConfig.url}" style="color:#777">${siteConfig.url.replace("https://", "")}</a></p>
  </td></tr></table></td></tr></table></body></html>`;
}

export interface OrderForEmail {
  id: string;
  number: number;
  /** Optional: without it only the owner is notified. */
  email: string | null;
  customerName: string;
  phone: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  paymentMethod: "COD" | "INSTAPAY" | "WALLET" | "CARD";
  paymentReference?: string | null;
  address: string;
  items: { name: string; color: string; size: string; quantity: number; unitPrice: number }[];
}

export const orderLink = (o: { number: number; id: string }) =>
  `${siteConfig.url}/order/${o.number}?t=${signToken("order", `${o.number}:${o.id}`)}`;

const METHOD: Record<string, string> = { COD: "Cash on delivery", INSTAPAY: "InstaPay", WALLET: "Mobile wallet", CARD: "Card" };

function itemsTable(o: OrderForEmail) {
  const rows = o.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.name)}<br><span style="color:#777;font-size:12px">${esc(i.color)} / ${esc(i.size)} × ${i.quantity}</span></td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid #eee">${egp(i.unitPrice * i.quantity)}</td></tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:16px 0">${rows}
    <tr><td style="padding:6px 0;color:#777">Shipping</td><td align="right">${egp(o.shippingFee)}</td></tr>
    ${o.discount ? `<tr><td style="padding:6px 0;color:#777">Discount</td><td align="right">-${egp(o.discount)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;font-weight:700">Total</td><td align="right" style="font-weight:700">${egp(o.total)}</td></tr></table>`;
}

/** Customer confirmation + owner alert for a new order. */
export async function notifyNewOrder(o: OrderForEmail, ownerEmail: string | null) {
  const link = orderLink(o);
  const transfer = o.paymentMethod === "INSTAPAY" || o.paymentMethod === "WALLET";

  const customerBody = `<p style="font-size:14px;line-height:22px">Hi ${esc(o.customerName)}, thank you for your order <strong>#${o.number}</strong>.
    ${transfer ? "We will confirm your transfer shortly and then start preparing it." : "We will contact you shortly to confirm delivery."}</p>
    ${itemsTable(o)}
    <p style="font-size:14px;margin:0 0 4px"><strong>Payment:</strong> ${esc(METHOD[o.paymentMethod])}</p>
    <p style="font-size:14px;margin:0 0 20px"><strong>Delivery to:</strong> ${esc(o.address)}</p>
    <p style="margin:0"><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px">View your order</a></p>`;

  const ownerLines = [
    `🛍️ New order #${o.number} — ${egp(o.total)}`,
    `${o.customerName} · ${o.phone}${o.email ? ` · ${o.email}` : ""}`,
    `${METHOD[o.paymentMethod]}${transfer ? ` · ref ${o.paymentReference ?? "n/a"} → confirm payment in the dashboard` : ""}`,
    ...o.items.map((i) => `• ${i.name} (${i.color}/${i.size}) ×${i.quantity}`),
    `${siteConfig.url}/admin/orders`,
  ];

  await Promise.allSettled([
    o.email
      ? sendEmail({
          to: o.email,
          subject: `Your ${siteConfig.name} order #${o.number}`,
          html: layout(`Order #${o.number} received`, customerBody),
          text: `Thank you for your order #${o.number} (${egp(o.total)}). View it: ${link}`,
        })
      : Promise.resolve(false),
    ownerEmail
      ? sendEmail({
          to: ownerEmail,
          subject: `New order #${o.number} — ${egp(o.total)}${transfer ? " (verify transfer)" : ""}`,
          html: layout(`New order #${o.number}`, `<pre style="font:14px/22px Arial;white-space:pre-wrap">${esc(ownerLines.join("\n"))}</pre>`),
          text: ownerLines.join("\n"),
        })
      : Promise.resolve(false),
    sendTelegram(ownerLines.join("\n")),
  ]);
}

export type StatusEvent = "PAYMENT_CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_COPY: Record<StatusEvent, { subject: string; text: string }> = {
  PAYMENT_CONFIRMED: { subject: "Payment received", text: "We have received your payment and are preparing your order." },
  SHIPPED: { subject: "Your order is on its way", text: "Your order has left our studio and is on its way to you." },
  DELIVERED: { subject: "Your order was delivered", text: "Your order has been delivered. We hope you love it!" },
  CANCELLED: { subject: "Your order was cancelled", text: "Your order has been cancelled. If you did not ask for this, or you already paid, please contact us and we will sort it out." },
};

export async function notifyOrderStatus(o: { id: string; number: number; email: string | null; customerName: string }, event: StatusEvent) {
  if (!o.email) return; // phone-only customer: nothing to email
  const copy = STATUS_COPY[event];
  const link = orderLink(o);
  await sendEmail({
    to: o.email,
    subject: `${copy.subject} — order #${o.number}`,
    html: layout(`${copy.subject} — #${o.number}`, `<p style="font-size:14px;line-height:22px">Hi ${esc(o.customerName)}, ${esc(copy.text)}</p>
      <p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px">View your order</a></p>`),
    text: `${copy.text} Order #${o.number}: ${link}`,
  });
}

export async function notifyWelcome(email: string) {
  const unsub = `${siteConfig.url}/unsubscribe?e=${encodeURIComponent(email)}&t=${signToken("unsubscribe", email)}`;
  await sendEmail({
    to: email,
    subject: `Welcome to ${siteConfig.name}`,
    html: layout("Welcome 👋", `<p style="font-size:14px;line-height:22px">Thanks for subscribing. You'll be the first to hear about new drops and offers.</p>
      <p style="font-size:12px;color:#777">Not interested any more? <a href="${unsub}" style="color:#777">Unsubscribe</a>.</p>`),
    text: `Thanks for subscribing to ${siteConfig.name}. Unsubscribe: ${unsub}`,
  });
}
