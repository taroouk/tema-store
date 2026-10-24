import "server-only";

/**
 * Live updates for the admin dashboard.
 *
 * The server publishes small events to a PRIVATE Supabase Realtime broadcast channel. Only signed-in,
 * active admins can listen (RLS policy on realtime.messages, see the admin_realtime migration), and
 * browsers cannot publish at all. Events carry no personal data beyond what the admin could open anyway:
 * a headline, an optional line and the admin link to follow.
 */
export type AdminEventType = "order.new" | "order.updated" | "payment.proof" | "message.new" | "subscriber.new" | "stock.low";

export interface AdminEvent {
  type: AdminEventType;
  title: string;
  body?: string;
  href?: string;
  /** Which permission an admin needs to be shown this event. */
  scope: "orders" | "customers" | "marketing" | "catalog";
  at: string;
}

export const ADMIN_CHANNEL = "admin-events";

/** Best-effort: a realtime outage must never affect checkout or any admin action. */
export async function publishAdminEvent(event: Omit<AdminEvent, "at">) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ topic: ADMIN_CHANNEL, event: "admin", payload: { ...event, at: new Date().toISOString() }, private: true }],
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[realtime] publish failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[realtime] publish error", e);
    return false;
  }
}
