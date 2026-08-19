import type { OfferItem } from "@/lib/db/schema";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function itemsSubtotal(items: OfferItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

/** KDV dahil toplamı hesaplar: kalemler toplamı + (kalemler toplamı * oran / 100). */
export function itemsTotalWithTax(items: OfferItem[], taxRatePercent: number): number {
  const subtotal = itemsSubtotal(items);
  return round2(subtotal + subtotal * (taxRatePercent / 100));
}
