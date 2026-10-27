"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { GOVERNORATES, normalizeEgyptianPhone } from "@/lib/egypt";
import { notifyNewOrder } from "@/lib/notify";
import { publishAdminEvent } from "@/lib/realtime";
import { priceForSize } from "@/lib/size-price";
import { signToken } from "@/lib/tokens";

import { CATALOG_TAG } from "@/lib/catalog";
import { couponDiscount, enabledPaymentMethods, shippingFee } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma/client";
import { rateLimit } from "@/lib/rate-limit";

type CouponCheck =
  | { ok: true; coupon: { id: string; code: string; type: "PERCENT" | "FIXED"; value: number } }
  | { ok: false; error: string };

/** Looks a coupon up and checks every rule. Used both for the preview and inside the order transaction. */
async function checkCoupon(
  db: Pick<typeof prisma, "coupon">,
  rawCode: string,
  subtotal: number
): Promise<CouponCheck> {
  const code = rawCode.trim().toUpperCase();
  const c = code ? await db.coupon.findUnique({ where: { code } }) : null;
  const now = new Date();

  if (!c || !c.isActive) return { ok: false, error: "Invalid coupon code" };
  if (c.startsAt && c.startsAt > now) return { ok: false, error: "This coupon is not active yet" };
  if (c.endsAt && c.endsAt < now) return { ok: false, error: "This coupon has expired" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { ok: false, error: "This coupon has been fully used" };
  if (c.minSubtotal && subtotal < Number(c.minSubtotal)) {
    return { ok: false, error: `Minimum order of EGP ${Number(c.minSubtotal)} required` };
  }
  return { ok: true, coupon: { id: c.id, code: c.code, type: c.type, value: Number(c.value) } };
}

export async function validateCoupon(code: string, subtotal: number) {
  if (!(await rateLimit("coupon", 20, 10 * 60_000))) return null;
  const r = await checkCoupon(prisma, String(code).slice(0, 40), Number(subtotal) || 0);
  return r.ok
    ? { ok: true as const, code: r.coupon.code, type: r.coupon.type, value: r.coupon.value }
    : { ok: false as const, error: r.error };
}

const text = (max: number) => z.string().trim().min(1).max(max);

const OrderInput = z.object({
  // Optional: customers may order with just a phone number and address.
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().toLowerCase().email("Enter a valid email address, or leave it empty").max(200).optional()
  ),
  phone: z.string().trim().max(30).refine((v) => normalizeEgyptianPhone(v) !== null, "Enter a valid Egyptian phone number (e.g. 01012345678)"),
  firstName: text(60),
  lastName: text(60),
  governorate: z.enum(GOVERNORATES, { message: "Choose your governorate" }),
  city: text(80),
  postal: z.string().trim().max(20).optional(),
  address: text(250),
  notes: z.string().trim().max(500).optional(),
  shippingMethod: z.enum(["standard", "express"]),
  coupon: z.string().trim().max(40).optional(),
  paymentMethod: z.enum(["cod", "instapay", "wallet"]),
  paymentSender: z.string().trim().max(60).optional(),
  paymentReference: z.string().trim().max(60).optional(),
  website: z.string().max(0).optional(), // honeypot
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        colorId: z.string().max(80),
        size: z.string().max(20),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(50),
});

export type PlaceOrderResult =
  | { ok: true; orderNumber: number; email: string | null; method: "cod" | "instapay" | "wallet"; total: number; confirmUrl: string }
  | { ok: false; error: string };

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  if (!(await rateLimit("order", 10, 10 * 60_000))) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = OrderInput.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${issue.path.join(".") || "Order"}: ${issue.message}` };
  }
  const data = parsed.data;

  const settings = await getSettings();

  if (!enabledPaymentMethods(settings.payments).includes(data.paymentMethod)) {
    return { ok: false, error: "That payment method is not available right now." };
  }
  const transfer = data.paymentMethod !== "cod";
  if (transfer) {
    if (!data.paymentSender || data.paymentSender.length < 4) {
      return { ok: false, error: "Enter the phone number or InstaPay address you sent the money from." };
    }
    if (!data.paymentReference || data.paymentReference.length < 4) {
      return { ok: false, error: "Enter the transfer reference number from your payment confirmation." };
    }
  }
  const colorSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...new Set(data.items.map((i) => i.productId))] }, status: "ACTIVE", deletedAt: null },
        include: { variants: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      // Merge duplicate lines, resolve each to a real variant and price from the DB.
      const lines = new Map<string, { variantId: string; productId: string; qty: number }>();
      for (const item of data.items) {
        const product = byId.get(item.productId);
        const variant = product?.variants.find(
          (v) => colorSlug(v.colorName) === item.colorId && v.size === item.size
        );
        if (!product || !variant) throw new CheckoutError("An item in your cart is no longer available.");
        const line = lines.get(variant.id) ?? { variantId: variant.id, productId: product.id, qty: 0 };
        line.qty += item.quantity;
        lines.set(variant.id, line);
      }

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      let subtotal = 0;

      for (const line of lines.values()) {
        const product = byId.get(line.productId)!;
        const variant = product.variants.find((v) => v.id === line.variantId)!;

        // Atomic reservation: only succeeds if enough stock is still there.
        const reserved = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: line.qty } },
          data: { stock: { decrement: line.qty } },
        });
        if (reserved.count === 0) {
          throw new CheckoutError(
            `Sorry, "${product.name}" (${variant.colorName} / ${variant.size}) is out of stock or has fewer than ${line.qty} left.`
          );
        }

        const price = priceForSize(
          { price: Number(product.price), priceLarge: product.priceLarge ? Number(product.priceLarge) : null },
          variant.size
        );
        subtotal += price * line.qty;
        orderItems.push({
          product: { connect: { id: product.id } },
          variant: { connect: { id: variant.id } },
          name: product.name,
          sku: variant.sku,
          color: variant.colorName,
          size: variant.size,
          image: product.images[0]?.url,
          unitPrice: price,
          quantity: line.qty,
        });
      }

      let discount = 0;
      let couponCode: string | null = null;
      if (data.coupon) {
        const check = await checkCoupon(tx, data.coupon, subtotal);
        if (!check.ok) throw new CheckoutError(check.error);
        // Atomic use-count increment so a limited coupon can't be over-redeemed.
        const used = await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE "id" = ${check.coupon.id}::uuid AND ("maxUses" IS NULL OR "usedCount" < "maxUses")`;
        if (used === 0) throw new CheckoutError("This coupon has been fully used");
        discount = couponDiscount(subtotal, check.coupon);
        couponCode = check.coupon.code;
      }
      const shipping = shippingFee(subtotal, data.shippingMethod, settings);
      const customerName = `${data.firstName} ${data.lastName}`;

      const phone = normalizeEgyptianPhone(data.phone)!;
      // Returning customers are recognised by email when given, otherwise by phone number.
      let customer;
      if (data.email) {
        customer = await tx.customer.upsert({
          where: { email: data.email },
          update: { name: customerName, phone },
          create: { email: data.email, name: customerName, phone },
        });
      } else {
        const existing = await tx.customer.findFirst({ where: { phone, email: null } });
        customer = existing
          ? await tx.customer.update({ where: { id: existing.id }, data: { name: customerName } })
          : await tx.customer.create({ data: { name: customerName, phone } });
      }

      return tx.order.create({
        data: {
          customerId: customer.id,
          email: data.email ?? null,
          customerName,
          phone: normalizeEgyptianPhone(data.phone)!,
          paymentMethod: data.paymentMethod === "instapay" ? "INSTAPAY" : data.paymentMethod === "wallet" ? "WALLET" : "COD",
          paymentStatus: transfer ? "AWAITING_VERIFICATION" : "UNPAID",
          paymentSender: transfer ? data.paymentSender : null,
          paymentReference: transfer ? data.paymentReference : null,
          subtotal,
          shippingFee: shipping,
          discount,
          total: subtotal - discount + shipping,
          couponCode,
          notes: data.notes,
          shippingAddress: {
            country: "Egypt",
            governorate: data.governorate,
            city: data.city,
            postalCode: data.postal ?? "",
            address: data.address,
            shippingMethod: data.shippingMethod,
          },
          items: { create: orderItems },
        },
        include: { items: true },
      });
    },
    // Under a burst of simultaneous checkouts, wait in line for a database connection instead of failing.
    { maxWait: 15_000, timeout: 20_000 });

    updateTag(CATALOG_TAG);
    revalidatePath("/admin/orders");
    after(() =>
      publishAdminEvent({
        type: "order.new",
        scope: "orders",
        title: `New order #${order.number}`,
        body: `${order.customerName} · EGP ${Number(order.total).toLocaleString("en-US")}`,
        href: `/admin/orders/${order.id}`,
      })
    );
    // Emails / alerts run after the response is sent and can never fail the order.
    after(() =>
      notifyNewOrder(
        {
          id: order.id,
          number: order.number,
          email: order.email,
          customerName: order.customerName,
          phone: order.phone,
          total: Number(order.total),
          subtotal: Number(order.subtotal),
          shippingFee: Number(order.shippingFee),
          discount: Number(order.discount),
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference,
          address: [data.address, data.city, data.governorate].join(", "),
          items: order.items.map((i) => ({ name: i.name, color: i.color, size: i.size, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
        },
        process.env.ORDER_NOTIFY_EMAIL || settings.supportEmail || null
      ).catch((e) => console.error("[notify] new order", e))
    );

    return {
      ok: true,
      orderNumber: order.number,
      email: order.email,
      method: data.paymentMethod,
      total: Number(order.total),
      confirmUrl: `/order/${order.number}?t=${signToken("order", `${order.number}:${order.id}`)}`,
    };
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    console.error("placeOrder failed", e);
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }
}

class CheckoutError extends Error {}
