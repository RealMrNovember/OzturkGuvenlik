import { describe, expect, test } from "vitest";
import { round2, itemsSubtotal, itemsTotalWithTax } from "@/lib/money";
import type { OfferItem } from "@/lib/db/schema";

describe("round2", () => {
  test("rounds to 2 decimal places", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10.001)).toBe(10);
    expect(round2(10)).toBe(10);
  });
});

describe("itemsSubtotal", () => {
  test("sums qty * unitPrice across items", () => {
    const items: OfferItem[] = [
      { name: "Kamera", qty: 4, unitPrice: 2200 },
      { name: "Kablo", qty: 100, unitPrice: 22 },
    ];
    expect(itemsSubtotal(items)).toBe(4 * 2200 + 100 * 22);
  });

  test("returns 0 for an empty item list", () => {
    expect(itemsSubtotal([])).toBe(0);
  });
});

describe("itemsTotalWithTax", () => {
  test("applies the tax rate on top of the subtotal (KDV dahil toplam)", () => {
    const items: OfferItem[] = [{ name: "Kurulum", qty: 1, unitPrice: 1000 }];
    expect(itemsTotalWithTax(items, 20)).toBe(1200);
  });

  test("returns the plain subtotal when tax rate is 0", () => {
    const items: OfferItem[] = [{ name: "Kurulum", qty: 2, unitPrice: 500 }];
    expect(itemsTotalWithTax(items, 0)).toBe(1000);
  });

  test("rounds the final total to 2 decimals", () => {
    const items: OfferItem[] = [{ name: "Test", qty: 3, unitPrice: 33.33 }];
    // 3 * 33.33 = 99.99, +%18 KDV = 117.9882 -> 117.99
    expect(itemsTotalWithTax(items, 18)).toBe(117.99);
  });
});
