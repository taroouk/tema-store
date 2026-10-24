import "server-only";

import { normalizeEgyptianPhone } from "@/lib/egypt";
import { prisma } from "@/lib/prisma/client";

/**
 * Finds an order from its number plus the contact the customer used at checkout — either the
 * email or the phone number. Both must match, so order numbers cannot be enumerated.
 */
export async function findOrderByContact(number: number, rawContact: string) {
  const contact = rawContact.trim();
  if (!contact || contact.length > 200) return null;

  const where = contact.includes("@")
    ? { email: contact.toLowerCase() }
    : (() => {
        const phone = normalizeEgyptianPhone(contact);
        return phone ? { phone } : null;
      })();
  if (!where) return null;

  return prisma.order.findFirst({ where: { number, ...where }, include: { items: true } });
}
