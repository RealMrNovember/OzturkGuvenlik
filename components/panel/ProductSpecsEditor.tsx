"use client";

import { Icon } from "@/components/icons";
import { Input } from "@/components/panel/ui";
import type { ProductSpec } from "@/lib/db/schema";

/** Ürüne göre değişen serbest teknik özellikler (Wi-Fi desteği, RAID desteği,
 * çözünürlük vb.) — sabit kolon yerine key/value listesi olarak tutulur. */
export function ProductSpecsEditor({
  specs,
  onChange,
}: {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
}) {
  const setSpec = (idx: number, patch: Partial<ProductSpec>) =>
    onChange(specs.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const addSpec = () => onChange([...specs, { key: "", value: "" }]);
  const removeSpec = (idx: number) => onChange(specs.filter((_, i) => i !== idx));

  return (
    <div className="rounded-xl border border-ink/10 bg-surface p-3.5">
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink/45">
        Teknik özellikler
      </p>
      {specs.length === 0 && (
        <p className="mb-2.5 text-xs text-ink/40">
          Örn: Wi-Fi Desteği → Var, RAID Desteği → RAID 0/1/5, Çözünürlük → 4MP
        </p>
      )}
      <div className="space-y-2">
        {specs.map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              value={s.key}
              onChange={(e) => setSpec(idx, { key: e.target.value })}
              placeholder="Özellik (örn: Wi-Fi Desteği)"
              className="flex-1"
            />
            <Input
              value={s.value}
              onChange={(e) => setSpec(idx, { value: e.target.value })}
              placeholder="Değer (örn: Var)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeSpec(idx)}
              aria-label="Özelliği kaldır"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addSpec}
        className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        <Icon name="plus" className="h-4 w-4" />
        Özellik ekle
      </button>
    </div>
  );
}
