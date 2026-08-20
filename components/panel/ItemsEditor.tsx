"use client";

import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { Input, fmtMoney } from "@/components/panel/ui";

export type ItemForm = {
  name: string;
  qty: string;
  unitPrice: string;
  productId?: number | null;
};

export type ProductOption = {
  id: number;
  name: string;
  unit: string;
  salePrice: string;
  costPrice?: string;
};

export const emptyItem = (): ItemForm => ({ name: "", qty: "1", unitPrice: "", productId: null });

export function ItemsEditor({
  items,
  onChange,
  products,
  taxRate,
  onTaxRateChange,
  priceField = "salePrice",
}: {
  items: ItemForm[];
  onChange: (items: ItemForm[]) => void;
  products: ProductOption[];
  taxRate: string;
  onTaxRateChange: (value: string) => void;
  /** "costPrice" ile toptancı/alış faturası kalemlerinde kataloğu seçince
   * satış fiyatı değil alış fiyatı önceden doldurulur. */
  priceField?: "salePrice" | "costPrice";
}) {
  const setItem = (idx: number, patch: Partial<ItemForm>) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const pickProduct = (idx: number, productId: string) => {
    const product = products.find((p) => String(p.id) === productId);
    if (!product) {
      setItem(idx, { productId: null });
      return;
    }
    setItem(idx, {
      productId: product.id,
      name: product.name,
      unitPrice: (priceField === "costPrice" ? product.costPrice : product.salePrice) ?? "",
    });
  };

  const addItem = () => onChange([...items, emptyItem()]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0),
    0
  );
  const tax = subtotal * ((Number(taxRate) || 0) / 100);

  return (
    <div className="rounded-2xl border border-ink/8 bg-surface p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/45">Kalemler</p>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-wrap items-center gap-2.5">
            <CustomSelect
              value={item.productId ? String(item.productId) : ""}
              onChange={(v) => pickProduct(idx, v)}
              options={products.map((p) => ({
                value: String(p.id),
                label: `${p.name} · ${fmtMoney((priceField === "costPrice" ? p.costPrice : p.salePrice) ?? 0)}/${p.unit}`,
              }))}
              placeholder="Kataloğdan seç…"
              className="w-full sm:w-56"
            />
            <Input
              value={item.name}
              onChange={(e) => setItem(idx, { name: e.target.value, productId: null })}
              placeholder="Ürün / hizmet adı"
              className="flex-1"
            />
            <Input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => setItem(idx, { qty: e.target.value })}
              className="w-20"
              aria-label="Adet"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => setItem(idx, { unitPrice: e.target.value, productId: null })}
              placeholder="₺"
              className="w-28"
              aria-label="Birim fiyat"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              aria-label="Kalemi kaldır"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <Icon name="plus" className="h-4 w-4" />
        Kalem ekle
      </button>

      <div className="mt-4 space-y-1.5 border-t border-ink/8 pt-3 text-sm">
        <div className="flex items-center justify-between text-ink/60">
          <span>Ara toplam</span>
          <span>{fmtMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-ink/60">
          <span className="flex items-center gap-2">
            KDV
            <Input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => onTaxRateChange(e.target.value)}
              className="w-16 py-1 text-xs"
              aria-label="KDV oranı"
            />
            %
          </span>
          <span>{fmtMoney(tax)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold text-ink">
          <span>Genel toplam</span>
          <span>{fmtMoney(subtotal + tax)}</span>
        </div>
      </div>
    </div>
  );
}
