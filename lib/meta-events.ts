// Meta Pixel standard events. Only product ids, quantities and EGP values are sent —
// never names, emails, phones or addresses. Safe no-op if the pixel is blocked/absent.
export const CURRENCY = "EGP";

type Line = { id: string; quantity: number };

function fbq(...args: unknown[]) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") window.fbq(...args);
  } catch {
    /* tracking must never affect the store */
  }
}

const contents = (lines: Line[]) => ({
  content_type: "product",
  content_ids: lines.map((l) => l.id),
  contents: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
});

export function trackViewContent(p: { id: string; name: string; value: number }) {
  fbq("track", "ViewContent", { content_type: "product", content_ids: [p.id], content_name: p.name, value: p.value, currency: CURRENCY });
}

export function trackAddToCart(line: Line & { value: number }) {
  fbq("track", "AddToCart", { ...contents([line]), value: line.value, currency: CURRENCY });
}

export function trackInitiateCheckout(lines: Line[], value: number) {
  fbq("track", "InitiateCheckout", {
    ...contents(lines),
    num_items: lines.reduce((n, l) => n + l.quantity, 0),
    value,
    currency: CURRENCY,
  });
}

/** `orderNumber` is only used as the dedup eventID (a number, not customer data). */
export function trackPurchase(lines: Line[], value: number, orderNumber: number) {
  fbq(
    "track",
    "Purchase",
    { ...contents(lines), num_items: lines.reduce((n, l) => n + l.quantity, 0), value, currency: CURRENCY },
    { eventID: `order-${orderNumber}` }
  );
}
