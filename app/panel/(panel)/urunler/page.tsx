"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import {
  Badge,
  Btn,
  EmptyState,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  fmtMoney,
} from "@/components/panel/ui";

type ProductRow = {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice?: string;
  salePrice: string;
  stockQty: number;
  active: boolean;
  createdAt: string;
};

const blank = {
  name: "",
  sku: "",
  category: "",
  unit: "adet",
  costPrice: "",
  salePrice: "",
  stockQty: "0",
};

export default function UrunlerPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      setRows(await api<ProductRow[]>("/api/products"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
  };

  const openEdit = (row: ProductRow) => {
    setForm({
      name: row.name,
      sku: row.sku,
      category: row.category,
      unit: row.unit,
      costPrice: row.costPrice ?? "",
      salePrice: row.salePrice,
      stockQty: String(row.stockQty),
    });
    setEditing(row);
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
      stockQty: Number(form.stockQty) || 0,
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
          <Btn onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            Yeni Ürün
          </Btn>
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
            <table className="w-full min-w-[720px] text-left text-sm">
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
                        <p className="font-bold text-ink">{p.name}</p>
                        <p className="text-xs text-ink/45">
                          {p.sku || "SKU yok"} · {p.unit}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-ink/70">{p.category || "-"}</td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right text-ink/55">
                          {fmtMoney(p.costPrice ?? 0)}
                        </td>
                      )}
                      <td className="px-5 py-4 text-right font-bold text-ink">
                        {fmtMoney(p.salePrice)}
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
                      <td className="px-5 py-4 text-right text-ink/70">{p.stockQty}</td>
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
            <Field label="Ürün / hizmet adı">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Örn: Hikvision 4MP IP Kamera"
              />
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
                <Input
                  type="number"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                  placeholder="₺"
                />
              </Field>
              <Field label="Satış fiyatı">
                <Input
                  type="number"
                  min="0"
                  value={form.salePrice}
                  onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                  placeholder="₺"
                />
              </Field>
            </div>
            <Field label="Stok adedi">
              <Input
                type="number"
                value={form.stockQty}
                onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
              />
            </Field>
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
    </div>
  );
}
