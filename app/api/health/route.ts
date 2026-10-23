import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

/** Liveness + database readiness probe for uptime monitors / load balancers. No details are leaked. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "degraded" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
