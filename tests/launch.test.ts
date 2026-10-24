import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GOVERNORATES, normalizeEgyptianPhone } from "@/lib/egypt";
import { applyPlaceholders } from "@/lib/content/placeholders";
import { signToken, verifyToken } from "@/lib/tokens";

describe("normalizeEgyptianPhone", () => {
  it.each([
    ["01012345678", "01012345678"],
    ["+20 101 234 5678", "01012345678"],
    ["0020-112-345-6789", "01123456789"],
    ["1212345678", "01212345678"],
    ["0227654321", "0227654321"],
  ])("accepts %s", (input, out) => expect(normalizeEgyptianPhone(input)).toBe(out));

  it.each(["", "abc", "0101234567", "01312345678", "+1 202 555 0100", "0101234567890"])("rejects %s", (input) =>
    expect(normalizeEgyptianPhone(input)).toBeNull()
  );
});

describe("governorates", () => {
  it("lists all 27 without duplicates", () => {
    expect(GOVERNORATES).toHaveLength(27);
    expect(new Set(GOVERNORATES).size).toBe(27);
  });
});

describe("signed tokens", () => {
  process.env.ORDER_TOKEN_SECRET = "test-secret";
  it("verifies its own token", () => {
    const t = signToken("order", "12:a@b.com");
    expect(verifyToken("order", "12:a@b.com", t)).toBe(true);
  });
  it("rejects a different value, purpose, or malformed token", () => {
    const t = signToken("order", "12:a@b.com");
    expect(verifyToken("order", "13:a@b.com", t)).toBe(false);
    expect(verifyToken("unsubscribe", "12:a@b.com", t)).toBe(false);
    expect(verifyToken("order", "12:a@b.com", "short")).toBe(false);
    expect(verifyToken("order", "12:a@b.com", undefined)).toBe(false);
  });
});

describe("applyPlaceholders", () => {
  const s = {
    storeName: "Tema Label",
    standardShippingFee: 80,
    expressShippingFee: 150,
    freeShippingThreshold: 1500,
    supportEmail: "",
    supportPhone: "",
  } as Parameters<typeof applyPlaceholders>[1];
  it("fills known tokens and leaves unknown ones", () => {
    expect(applyPlaceholders("{{storeName}} ships free over {{freeThreshold}} {{nope}}", s)).toBe("Tema Label ships free over EGP 1,500 {{nope}}");
  });
});

import { can } from "@/lib/auth/permissions";

describe("product deletion permission", () => {
  it("only admins can permanently delete; editors can archive", () => {
    expect(can("SUPER_ADMIN", "catalog:delete")).toBe(true);
    expect(can("ADMIN", "catalog:delete")).toBe(true);
    expect(can("EDITOR", "catalog:delete")).toBe(false);
    expect(can("EDITOR", "catalog:write")).toBe(true);
    expect(can("SUPPORT", "catalog:delete")).toBe(false);
  });
});

import { permissionForPath } from "@/lib/auth/route-permissions";

describe("permissionForPath", () => {
  it("maps admin sections to their permission", () => {
    expect(permissionForPath("/admin/orders")).toBe("orders:manage");
    expect(permissionForPath("/admin/orders/abc")).toBe("orders:manage");
    expect(permissionForPath("/admin/products/new")).toBe("catalog:write");
    expect(permissionForPath("/admin/admins")).toBe("admins:manage");
  });
  it("only needs a login for the dashboard and profile", () => {
    expect(permissionForPath("/admin")).toBeUndefined();
    expect(permissionForPath("/admin/profile")).toBeUndefined();
  });
  it("does not match look-alike prefixes", () => {
    expect(permissionForPath("/admin/orders-archive")).toBeUndefined();
  });
});
