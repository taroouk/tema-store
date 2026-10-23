import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short signed tokens for links we hand to customers (order confirmation, unsubscribe).
 * The token proves the link was issued by us for that exact value; nothing secret is stored.
 */
function secret() {
  const s = process.env.ORDER_TOKEN_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!s) throw new Error("ORDER_TOKEN_SECRET (or SUPABASE_SECRET_KEY) is not set");
  return s;
}

export function signToken(purpose: "order" | "unsubscribe", value: string) {
  return createHmac("sha256", secret()).update(`${purpose}:${value}`).digest("base64url").slice(0, 32);
}

export function verifyToken(purpose: "order" | "unsubscribe", value: string, token: unknown) {
  if (typeof token !== "string" || token.length !== 32) return false;
  const expected = Buffer.from(signToken(purpose, value));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
