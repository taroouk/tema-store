import "server-only";

import { headers } from "next/headers";

const hits = new Map<string, number[]>();

/**
 * Best-effort in-memory sliding-window limiter. It protects a single server instance;
 * for multi-instance deployments swap the store for Redis/Upstash.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(id, recent);
    return false;
  }
  recent.push(now);
  hits.set(id, recent);

  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
