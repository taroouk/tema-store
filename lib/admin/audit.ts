import "server-only";

import type { AdminUser, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

export async function audit(
  admin: Pick<AdminUser, "id" | "email">,
  entry: {
    action: string;
    entity: string;
    entityId?: string;
    summary: string;
    metadata?: Prisma.InputJsonValue;
  }
) {
  await prisma.auditLog.create({
    data: { adminId: admin.id, adminEmail: admin.email, ...entry },
  });
}
