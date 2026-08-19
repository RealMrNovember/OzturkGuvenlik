"use client";

import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { Input } from "@/components/panel/ui";
import { LOW_STOCK_THRESHOLD } from "@/lib/db/schema";

export type JobItemForm = { productId: number | null; name: string; qty: string };
export type JobProductOption = { id: number; name: string; unit: string; stockQty: number };

export const emptyJobItem = (): JobItemForm => ({ productId: null, name: "", qty: "1" });

export function JobItemsEditor({
  items,
  onChange,
  products,
}: {
  items: JobItemForm[];
  onChange: (items: JobItemForm[]) => void;
  products: JobProductOption[];
}) {
  const setItem = (idx: number, patch: Partial<JobItemForm>) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const pickProduct = (idx: number, productId: string) => {
    const product = products.find((p) => String(p.id) === productId);
    if (!product) {
      setItem(idx, { productId: null, name: "" });
      return;
    }
    setItem(idx, { productId: product.id, name: product.name });
  };

  const addItem = () => onChange([...items, emptyJobItem()]);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="rounded-2xl border border-ink/8 bg-surface p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/45">
        Kullanılan ürünler <span className="normal-case text-ink/35">(kaydedilince stoktan düşer)</span>
      </p>
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const product = products.find((p) => p.id === item.productId);
          const low = product ? product.stockQty <= LOW_STOCK_THRESHOLD : false;
          return (
            <div key={idx} className="flex flex-wrap items-center gap-2.5">
              <CustomSelect
                value={item.productId ? String(item.productId) : ""}
                onChange={(v) => pickProduct(idx, v)}
                options={products.map((p) => ({
                  value: String(p.id),
                  label: `${p.name} · stok: ${p.stockQty} ${p.unit}`,
                }))}
                placeholder="Ürün seçin…"
                className="w-full flex-1 sm:w-auto"
              />
              <Input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => setItem(idx, { qty: e.target.value })}
                className="w-20"
                aria-label="Adet"
              />
              {product && (
                <span className={`text-xs ${low ? "font-semibold text-red-500" : "text-ink/40"}`}>
                  {low ? "Stok az!" : `Stok: ${product.stockQty}`}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                aria-label="Kalemi kaldır"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-sm text-ink/40">Henüz ürün eklenmedi.</p>
        )}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <Icon name="plus" className="h-4 w-4" />
        Ürün ekle
      </button>
    </div>
  );
}
