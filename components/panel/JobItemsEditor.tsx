"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { Input } from "@/components/panel/ui";
import { BarcodeScannerModal } from "@/components/panel/BarcodeScanner";
import { LOW_STOCK_THRESHOLD } from "@/lib/db/schema";
import { api } from "@/lib/fetch";

export type JobItemForm = {
  productId: number | null;
  name: string;
  qty: string;
  unitIds?: number[];
};
export type JobProductOption = {
  id: number;
  name: string;
  unit: string;
  stockQty: number;
  serialized?: boolean;
};
type UnitOption = { id: number; serialNumber: string; status: string };

export const emptyJobItem = (): JobItemForm => ({ productId: null, name: "", qty: "1", unitIds: undefined });

function SerialUnitPicker({
  productId,
  selectedUnitIds,
  onChange,
}: {
  productId: number;
  selectedUnitIds: number[];
  onChange: (unitIds: number[]) => void;
}) {
  const [units, setUnits] = useState<UnitOption[] | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMsg, setScanMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<UnitOption[]>(`/api/products/${productId}/units`)
      .then((rows) => {
        if (!cancelled) setUnits(rows.filter((u) => u.status === "stokta"));
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const toggle = (id: number) => {
    onChange(
      selectedUnitIds.includes(id)
        ? selectedUnitIds.filter((x) => x !== id)
        : [...selectedUnitIds, id]
    );
  };

  const handleScan = (code: string) => {
    const match = units?.find((u) => u.serialNumber === code);
    if (!match) {
      setScanMsg(`"${code}" stokta bulunamadı`);
      return;
    }
    if (selectedUnitIds.includes(match.id)) {
      setScanMsg(`${code} zaten seçili`);
      return;
    }
    onChange([...selectedUnitIds, match.id]);
    setScanMsg(`✓ ${code} eklendi`);
  };

  return (
    <div className="w-full rounded-xl border border-ink/10 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink/60">
          {selectedUnitIds.length} seçili
          {units ? ` · ${units.length} stokta` : " · yükleniyor…"}
        </span>
        <button
          type="button"
          onClick={() => {
            setScanMsg("");
            setScannerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:border-brand/50"
        >
          <Icon name="search" className="h-3.5 w-3.5" />
          Tara
        </button>
      </div>
      {scanMsg && <p className="mt-1 text-xs text-ink/50">{scanMsg}</p>}
      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
        {units?.length === 0 && <p className="text-xs text-ink/40">Stokta seri numarası yok.</p>}
        {units?.map((u) => (
          <label key={u.id} className="flex items-center gap-2 text-xs text-ink/80">
            <input
              type="checkbox"
              checked={selectedUnitIds.includes(u.id)}
              onChange={() => toggle(u.id)}
              className="h-3.5 w-3.5 accent-brand"
            />
            <span className="font-mono">{u.serialNumber}</span>
          </label>
        ))}
      </div>
      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        title="Seri Numarası Tara"
        continuous
      />
    </div>
  );
}

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
      setItem(idx, { productId: null, name: "", unitIds: undefined });
      return;
    }
    setItem(idx, {
      productId: product.id,
      name: product.name,
      unitIds: product.serialized ? [] : undefined,
      qty: product.serialized ? "0" : items[idx].qty,
    });
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
            <div key={idx} className="flex flex-wrap items-start gap-2.5">
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
              {product?.serialized ? (
                <SerialUnitPicker
                  productId={product.id}
                  selectedUnitIds={item.unitIds ?? []}
                  onChange={(unitIds) => setItem(idx, { unitIds, qty: String(unitIds.length) })}
                />
              ) : (
                <>
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
                </>
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
