"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { LOW_STOCK_THRESHOLD } from "@/lib/db/schema";
import { BarcodeScannerModal } from "@/components/panel/BarcodeScanner";
import { CurrencyAmountInput } from "@/components/panel/CurrencyAmountInput";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import {
  Badge,
  Btn,
  EmptyState,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice?: string;
  salePrice: string;
  currency: string;
  exchangeRate: string;
  stockQty: number;
  barcode: string | null;
  serialized: boolean;
  active: boolean;
  createdAt: string;
};

type LookupResponse =
  | { found: true; source: "local"; product: ProductRow }
  | { found: true; source: "global"; suggestion: { name: string; category: string } }
  | { found: false };

const blank = {
  name: "",
  sku: "",
  category: "",
  unit: "adet",
  costPrice: "",
  salePrice: "",
  currency: "TRY",
  exchangeRate: 1,
  stockQty: "0",
  barcode: "",
  serialized: false,
};

export default function UrunlerPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [fieldScannerOpen, setFieldScannerOpen] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const openEdit = useCallback((row: ProductRow) => {
    setForm({
      name: row.name,
      sku: row.sku,
      category: row.category,
      unit: row.unit,
      costPrice: row.costPrice ?? "",
      salePrice: row.salePrice,
      currency: row.currency ?? "TRY",
      exchangeRate: Number(row.exchangeRate ?? 1),
      stockQty: String(row.stockQty),
      barcode: row.barcode ?? "",
      serialized: row.serialized,
    });
    setNotice("");
    setEditing(row);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await api<ProductRow[]>("/api/products");
      setRows(data);
      const editId = searchParams.get("edit");
      if (editId) {
        const target = data.find((p) => p.id === Number(editId));
        if (target) openEdit(target);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEdit]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(blank);
    setNotice("");
    setCreating(true);
  };

  const handleBarcodeScan = async (code: string) => {
    setScannerOpen(false);
    setLookingUp(true);
    setError("");
    try {
      const res = await api<LookupResponse>(`/api/products/lookup?barcode=${encodeURIComponent(code)}`);
      if (res.found && res.source === "local") {
        openEdit(res.product);
        setNotice(
          res.product.serialized
            ? "Bu ürün seri takipli — yeni gelen cihazları ürün detayından ekleyin."
            : "Bu barkod zaten kayıtlı. Yeni gelen stoğu aşağıdan ekleyin."
        );
      } else if (res.found && res.source === "global") {
        setForm({ ...blank, barcode: code, name: res.suggestion.name, category: res.suggestion.category });
        setNotice("Genel ürün veritabanından önerildi — bilgileri kontrol edip kaydedin.");
        setCreating(true);
      } else {
        setForm({ ...blank, barcode: code });
        setNotice("Bu barkod hiçbir yerde bulunamadı — yeni ürün olarak ekleyin.");
        setCreating(true);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLookingUp(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.salePrice) {
      setError("Ürün adı ve satış fiyatı zorunlu.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      unit: form.unit.trim() || "adet",
      costPrice: Number(form.costPrice) || 0,
      salePrice: Number(form.salePrice),
      currency: form.currency,
      exchangeRate: form.exchangeRate,
      stockQty: Number(form.stockQty) || 0,
      barcode: form.barcode.trim(),
      serialized: form.serialized,
    };
    try {
      if (editing) {
        await api(`/api/products/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/products", { method: "POST", body: JSON.stringify(payload) });
      }
      setCreating(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: ProductRow) => {
    if (!confirm(`${row.name} silinsin mi?`)) return;
    try {
      await api(`/api/products/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Ürünler</h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kayıt{!isAdmin && " · alış fiyatları yalnızca yöneticiye görünür"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2.5">
            <Btn variant="ghost" onClick={() => setScannerOpen(true)} disabled={lookingUp}>
              <Icon name="search" className="h-4 w-4" />
              {lookingUp ? "Aranıyor…" : "Barkod Tara"}
            </Btn>
            <Btn onClick={openCreate}>
              <Icon name="plus" className="h-4 w-4" />
              Yeni Ürün
            </Btn>
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Ürün yok" desc="Kataloğa ürün ekleyerek tekliflerde hızlıca seçebilirsiniz." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Ürün</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Alış</th>}
                  <th className="px-5 py-3.5 text-right">Satış</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Kâr marjı</th>}
                  <th className="px-5 py-3.5 text-right">Stok</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">İşlem</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((p) => {
                  const margin =
                    isAdmin && p.costPrice !== undefined && Number(p.salePrice) > 0
                      ? ((Number(p.salePrice) - Number(p.costPrice)) / Number(p.salePrice)) * 100
                      : null;
                  return (
                    <tr key={p.id} className="align-top hover:bg-ink/2">
                      <td className="px-5 py-4">
                        <Link href={`/panel/urunler/${p.id}`} className="font-bold text-ink hover:text-brand">
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink/45">
                          {p.sku || "SKU yok"} · {p.unit}
                          {p.serialized && " · seri takipli"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-ink/70">{p.category || "-"}</td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right text-ink/55">
                          {fmtMoneyWithTry(p.costPrice ?? 0, p.currency, p.exchangeRate)}
                        </td>
                      )}
                      <td className="px-5 py-4 text-right font-bold text-ink">
                        {fmtMoneyWithTry(p.salePrice, p.currency, p.exchangeRate)}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right">
                          {margin !== null && (
                            <Badge tone={margin >= 30 ? "green" : margin >= 10 ? "amber" : "red"}>
                              %{margin.toFixed(0)}
                            </Badge>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-4 text-right">
                        <span
                          className={
                            p.stockQty <= LOW_STOCK_THRESHOLD
                              ? "font-bold text-red-500"
                              : "text-ink/70"
                          }
                        >
                          {p.stockQty}
                        </span>
                        {p.stockQty <= LOW_STOCK_THRESHOLD && (
                          <span className="ml-2">
                            <Badge tone="red">Kritik</Badge>
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              aria-label="Düzenle"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                            >
                              <Icon name="pen" className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(p)}
                              aria-label="Sil"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
        title="Ürün Barkodu Tara"
      />

      {(creating || editing) && isAdmin && (
        <Modal
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? "Ürünü Düzenle" : "Yeni Ürün"}
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            {notice && (
              <p className="rounded-xl bg-brand/5 px-4 py-3 text-xs text-ink/60">{notice}</p>
            )}
            <Field label="Ürün / hizmet adı">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Örn: Hikvision 4MP IP Kamera"
              />
            </Field>
            <Field label="Kutu barkodu (EAN/UPC)">
              <div className="flex gap-2">
                <Input
                  value={form.barcode}
                  onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                  placeholder="Opsiyonel — sonra da eklenebilir"
                  className="flex-1"
                />
                <Btn type="button" variant="ghost" onClick={() => setFieldScannerOpen(true)}>
                  <Icon name="search" className="h-4 w-4" />
                </Btn>
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori">
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Örn: Kamera"
                />
              </Field>
              <Field label="Birim">
                <Input
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="adet / metre / hizmet"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Alış fiyatı (yalnızca sizde görünür)">
                <div className="flex items-center rounded-xl border border-ink/15 bg-white">
                  <input
                    type="number"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-l-xl bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink/35"
                  />
                  <span className="rounded-r-xl border-l border-ink/10 bg-surface px-3 py-2.5 text-sm font-bold text-ink/50">
                    {CURRENCY_SYMBOL[form.currency as keyof typeof CURRENCY_SYMBOL]}
                  </span>
                </div>
              </Field>
              <Field label="Satış fiyatı">
                <CurrencyAmountInput
                  amount={form.salePrice}
                  currency={form.currency}
                  exchangeRate={form.exchangeRate}
                  onChange={(patch) =>
                    setForm((f) => ({
                      ...f,
                      salePrice: patch.amount ?? f.salePrice,
                      currency: patch.currency ?? f.currency,
                      exchangeRate: patch.exchangeRate ?? f.exchangeRate,
                    }))
                  }
                />
              </Field>
            </div>
            <p className="-mt-2 text-xs text-ink/40">
              Alış ve satış fiyatı aynı para biriminde kaydedilir; para birimini satış fiyatından değiştirin.
            </p>

            <label className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-surface px-3.5 py-3">
              <input
                type="checkbox"
                checked={form.serialized}
                onChange={(e) => setForm((f) => ({ ...f, serialized: e.target.checked }))}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm text-ink">
                <span className="font-semibold">Seri numaralı takip</span>
                <span className="block text-xs text-ink/50">
                  Her fiziksel cihaz ayrı seri numarasıyla izlenir (kamera, DVR/NVR gibi). Kablo/
                  sarf malzemede kapalı bırakın.
                </span>
              </span>
            </label>

            {form.serialized ? (
              <p className="rounded-xl bg-surface px-4 py-3 text-xs text-ink/55">
                Stok adedi artık seri numaralarından otomatik hesaplanır.
                {editing && (
                  <>
                    {" "}
                    <Link href={`/panel/urunler/${editing.id}`} className="font-semibold text-brand">
                      Seri numaralarını yönet →
                    </Link>
                  </>
                )}
              </p>
            ) : (
              <Field label="Stok adedi">
                <Input
                  type="number"
                  value={form.stockQty}
                  onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
                />
              </Field>
            )}

            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      <BarcodeScannerModal
        open={fieldScannerOpen}
        onClose={() => setFieldScannerOpen(false)}
        onScan={(code) => {
          setForm((f) => ({ ...f, barcode: code }));
          setFieldScannerOpen(false);
        }}
        title="Barkod Tara"
      />
    </div>
  );
}
