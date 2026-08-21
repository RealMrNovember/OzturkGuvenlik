import { describe, expect, test } from "vitest";
import { hasPermission } from "@/lib/permissions";

describe("hasPermission", () => {
  test("admin role always has every permission, regardless of the permissions array", () => {
    expect(hasPermission({ role: "admin", permissions: [] }, "manage_settings")).toBe(true);
    expect(hasPermission({ role: "admin", permissions: null }, "delete_records")).toBe(true);
  });

  test("staff role is granted only the permissions explicitly listed", () => {
    const session = { role: "staff", permissions: ["view_costs"] };
    expect(hasPermission(session, "view_costs")).toBe(true);
    expect(hasPermission(session, "manage_settings")).toBe(false);
  });

  test("staff with no permissions array has no permissions", () => {
    expect(hasPermission({ role: "staff" }, "manage_products")).toBe(false);
    expect(hasPermission({ role: "staff", permissions: null }, "manage_products")).toBe(false);
  });

  test("no session (logged out) has no permissions", () => {
    expect(hasPermission(null, "manage_settings")).toBe(false);
    expect(hasPermission(undefined, "delete_records")).toBe(false);
  });
});
