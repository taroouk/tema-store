/**
 * Integration tests for checkout against the REAL database (opt-in):
 *     npm run test:integration
 * Everything they create is prefixed "qa-int" and removed afterwards; real products are never touched.
 */
import { config } from "dotenv";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

config({ path: ".env.local", quiet: true });

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  updateTag: () => undefined,
  revalidatePath: () => undefined,
}));
vi.mock("next/server", () => ({ after: () => undefined }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => true }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const run = process.env.RUN_INTEGRATION === "1";
const tag = `qa-int-${Date.now()}`;
const email = (n: string) => `${tag}-${n}@example.com`;

type Place = typeof import("@/app/checkout/actions");
let actions: Place;
let prisma: typeof import("@/lib/prisma/client").prisma;
let release: typeof import("@/lib/orders/release").releaseOrderStock;

const ids: { product?: string; variant?: string; cheap?: string; cheapVariant?: string; coupons: string[] } = { coupons: [] };

const input = (over: Record<string, unknown> = {}, qty = 1, productId = ids.product!) => ({
  email: email("buyer"),
  phone: "01012345678",
  firstName: "Qa",
  lastName: "Tester",
  governorate: "Cairo",
  city: "Nasr City",
  address: "1 Test Street",
  shippingMethod: "standard",
  paymentMethod: "cod",
  items: [{ productId, colorId: "black", size: "M", quantity: qty }],
  ...over,
});

async function stock(variantId = ids.variant!) {
  return (await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } })).stock;
}

describe.skipIf(!run)("checkout (real database)", { timeout: 60_000 }, () => {
  beforeAll(async () => {
    ({ prisma } = await import("@/lib/prisma/client"));
    actions = await import("@/app/checkout/actions");
    ({ releaseOrderStock: release } = await import("@/lib/orders/release"));

    const category = await prisma.category.findFirstOrThrow();
    const make = async (name: string, price: number, stockQty: number) => {
      const p = await prisma.product.create({
        data: {
          name,
          slug: `${tag}-${name.toLowerCase().replace(/\W+/g, "-")}`,
          description: "qa",
          price,
          status: "ACTIVE",
          categoryId: category.id,
          variants: { create: [{ sku: `${tag}-${price}`.toUpperCase(), colorName: "Black", colorHex: "#000000", size: "M", stock: stockQty }] },
        },
        include: { variants: true },
      });
      return { id: p.id, variant: p.variants[0].id };
    };
    const a = await make("QA Race", 100, 3);
    ids.product = a.id;
    ids.variant = a.variant;
    const b = await make("QA Big", 2000, 50);
    ids.cheap = b.id;
    ids.cheapVariant = b.variant;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.order.deleteMany({ where: { email: { startsWith: tag } } });
    await prisma.customer.deleteMany({ where: { email: { startsWith: tag } } });
    await prisma.coupon.deleteMany({ where: { code: { startsWith: "QAINT" } } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: tag } } });
    await prisma.$disconnect();
  });

  it("never oversells: 10 parallel buyers for 3 units → exactly 3 orders", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => actions.placeOrder(input({ email: email(`race${i}`) }))));
    const ok = results.filter((r) => r.ok);
    expect(ok).toHaveLength(3);
    expect(await stock()).toBe(0);
    const failed = results.filter((r) => !r.ok) as { ok: false; error: string }[];
    expect(failed).toHaveLength(7);
    expect(failed.every((f) => /out of stock/i.test(f.error))).toBe(true);
    expect(await prisma.order.count({ where: { email: { startsWith: `${tag}-race` } } })).toBe(3);
  });

  it("cancelling an order returns its stock exactly once", async () => {
    const order = await prisma.order.findFirstOrThrow({ where: { email: { startsWith: `${tag}-race` } }, include: { items: true } });
    await prisma.$transaction((tx) => release(tx, order));
    expect(await stock()).toBe(1);
  });

  it("prices come from the database and totals add up", async () => {
    const r = await actions.placeOrder(input({ email: email("price"), items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 2 }] }));
    expect(r.ok).toBe(true);
    const o = await prisma.order.findFirstOrThrow({ where: { email: email("price") }, include: { items: true } });
    expect(Number(o.subtotal)).toBe(4000);
    expect(Number(o.shippingFee)).toBe(0); // over the free-shipping threshold
    expect(Number(o.total)).toBe(4000);
    expect(o.items[0].unitPrice.toString()).toBe("2000");
    expect(o.phone).toBe("01012345678");
  });

  it("express shipping is never free", async () => {
    const r = await actions.placeOrder(input({ email: email("express"), shippingMethod: "express", items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] }));
    expect(r.ok).toBe(true);
    const o = await prisma.order.findFirstOrThrow({ where: { email: email("express") } });
    expect(Number(o.shippingFee)).toBeGreaterThan(0);
  });

  it("a limited coupon can only be redeemed once, and a losing order leaves stock untouched", async () => {
    const c = await prisma.coupon.create({ data: { code: "QAINTONE", type: "FIXED", value: 50, maxUses: 1 } });
    ids.coupons.push(c.id);
    const before = await stock(ids.cheapVariant);
    const [a, b] = await Promise.all([
      actions.placeOrder(input({ email: email("c1"), coupon: "QAINTONE", items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] })),
      actions.placeOrder(input({ email: email("c2"), coupon: "QAINTONE", items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] })),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect(await stock(ids.cheapVariant)).toBe(before - 1);
    expect((await prisma.coupon.findUniqueOrThrow({ where: { id: c.id } })).usedCount).toBe(1);
    const winner = await prisma.order.findFirstOrThrow({ where: { couponCode: "QAINTONE" } });
    expect(Number(winner.discount)).toBe(50);
    expect(Number(winner.total)).toBe(Number(winner.subtotal) - 50 + Number(winner.shippingFee));
  });

  it("rejects expired, inactive and below-minimum coupons", async () => {
    await prisma.coupon.createMany({
      data: [
        { code: "QAINTEXPIRED", type: "PERCENT", value: 10, endsAt: new Date(Date.now() - 86_400_000) },
        { code: "QAINTOFF", type: "PERCENT", value: 10, isActive: false },
        { code: "QAINTMIN", type: "PERCENT", value: 10, minSubtotal: 99999 },
      ],
    });
    for (const code of ["QAINTEXPIRED", "QAINTOFF", "QAINTMIN", "NOPE"]) {
      const r = await actions.validateCoupon(code, 500);
      expect(r?.ok).toBe(false);
    }
  });

  it("rejects bad input", async () => {
    const bad: [string, Record<string, unknown>][] = [
      ["non-Egyptian phone", { phone: "+1 202 555 0100" }],
      ["unknown governorate", { governorate: "Atlantis" }],
      ["bot honeypot filled", { website: "http://spam.example" }],
      ["quantity above 20", { items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 21 }] }],
      ["unknown product", { items: [{ productId: "00000000-0000-4000-8000-000000000000", colorId: "black", size: "M", quantity: 1 }] }],
      ["unknown size", { items: [{ productId: ids.cheap, colorId: "black", size: "XXXL", quantity: 1 }] }],
      ["empty cart", { items: [] }],
      ["transfer without reference", { paymentMethod: "wallet", paymentSender: "01000000000" }],
    ];
    for (const [name, over] of bad) {
      const r = await actions.placeOrder(input({ email: email("bad"), ...over }));
      expect(r.ok, name).toBe(false);
    }
    expect(await prisma.order.count({ where: { email: email("bad") } })).toBe(0);
  });

  it("an archived product cannot be bought", async () => {
    await prisma.product.update({ where: { id: ids.cheap }, data: { status: "ARCHIVED", deletedAt: new Date() } });
    const r = await actions.placeOrder(input({ email: email("arch"), items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] }));
    expect(r.ok).toBe(false);
    await prisma.product.update({ where: { id: ids.cheap }, data: { status: "ACTIVE", deletedAt: null } });
  });

  it("returning customers reuse one customer record", async () => {
    await prisma.productVariant.update({ where: { id: ids.cheapVariant }, data: { stock: 10 } });
    for (let i = 0; i < 2; i++) {
      const r = await actions.placeOrder(input({ email: email("repeat"), items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] }));
      expect(r.ok).toBe(true);
    }
    expect(await prisma.customer.count({ where: { email: email("repeat") } })).toBe(1);
    expect(await prisma.order.count({ where: { email: email("repeat") } })).toBe(2);
  });

  it("a confirmation link is only valid for its own order", async () => {
    const r = await actions.placeOrder(input({ email: email("link"), items: [{ productId: ids.cheap, colorId: "black", size: "M", quantity: 1 }] }));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.confirmUrl).toMatch(/^\/order\/\d+\?t=[\w-]{32}$/);
    const { verifyToken } = await import("@/lib/tokens");
    const t = r.confirmUrl.split("t=")[1];
    expect(verifyToken("order", `${r.orderNumber}:${r.email}`, t)).toBe(true);
    expect(verifyToken("order", `${r.orderNumber + 1}:${r.email}`, t)).toBe(false);
  });
});
