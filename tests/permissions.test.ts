import { describe, expect, it } from "vitest";

import { can } from "@/lib/auth/permissions";

describe("role permissions", () => {
  it("only super admins manage admins", () => {
    expect(can("SUPER_ADMIN", "admins:manage")).toBe(true);
    for (const r of ["ADMIN", "EDITOR", "SUPPORT"] as const) expect(can(r, "admins:manage")).toBe(false);
  });
  it("editors cannot see orders or settings", () => {
    expect(can("EDITOR", "catalog:write")).toBe(true);
    expect(can("EDITOR", "orders:manage")).toBe(false);
    expect(can("EDITOR", "settings:manage")).toBe(false);
  });
  it("support handles orders but cannot edit the catalog", () => {
    expect(can("SUPPORT", "orders:manage")).toBe(true);
    expect(can("SUPPORT", "catalog:write")).toBe(false);
  });
});
