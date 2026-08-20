"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { ItemsEditor, emptyItem, type ItemForm, type ProductOption } from "@/components/panel/ItemsEditor";
import {
  Btn,
  EmptyState,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  StatusBadge,
  Textarea,
  OFFER_STATUS_LABEL,
  fmtDate,
  fmtDateTime,
  fmtMoney,
} from "@/components/panel/ui";

type OfferRow = {
  id: number;
  customerId: number | null;
  requestId: number | null;
  title: string;
  items: { name: string; qty: number; unitPrice: number; productId?: number | null }[];
  taxRate: string;
  total: string;
  status: string;
  sentDate: string | null;
  note: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
};

type CustomerRow = { id: number; name: string; phone: string };

export default function TekliflerPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";

  const [rows, setRows] = useState<OfferRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<OfferRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<OfferRow | null>(null);

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("tasarim");
  const [sentDate, setSentDate] = useState("");
  const [note, setNote] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);

  const load = useCallback(async () => {
    try {
      const [offers, custs, prods] = await Promise.all([
        api<OfferRow[]>("/api/offers"),
        api<CustomerRow[]>("/api/customers"),
        api<ProductOption[]>("/api/products"),
      ]);
      setRows(offers);
      setCustomers(custs);
      setProducts(prods);
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

  const resetForm = () => {
    setTitle("");
    setCustomerId("");
    setStatus("tasarim");
    setSentDate("");
    setNote("");
    setTaxRate("20");
    setItems([emptyItem()]);
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
  };

  const openEdit = (row: OfferRow) => {
    setTitle(row.title);
    setCustomerId(row.customerId ? String(row.customerId) : "");
    setStatus(row.status);
    setSentDate(row.sentDate ?? "");
    setNote(row.note);
    setTaxRate(row.taxRate);
    setItems(
      row.items.map((i) => ({
        name: i.name,
        qty: String(i.qty),
        unitPrice: String(i.unitPrice),
        productId: i.productId ?? null,
      }))
    );
    setEditing(row);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const cleanItems = items
      .filter((i) => i.name.trim() && Number(i.qty) > 0)
      .map((i) => ({
        name: i.name.trim(),
        qty: Number(i.qty),
        unitPrice: Number(i.unitPrice) || 0,
        productId: i.productId ?? null,
      }));
    if (cleanItems.length === 0) {
      setError("En az bir kalem ekleyin.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title,
      customerId: customerId ? Number(customerId) : null,
      items: cleanItems,
      taxRate: Number(taxRate) || 0,
      status,
      sentDate: sentDate || null,
      note,
    };
    try {
      if (editing) {
        await api(`/api/offers/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/offers", { method: "POST", body: JSON.stringify(payload) });
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

  const remove = async (row: OfferRow) => {
    if (!confirm(`${row.title || `#${row.id}`} silinsin mi?`)) return;
    try {
      await api(`/api/offers/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Teklifler</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} kayıt</p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Teklif
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Teklif yok" desc="Yeni teklif oluşturarak başlayın." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Teklif</th>
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Tutar</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Gönderim</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((o) => (
                  <tr key={o.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setViewing(o)} className="text-left">
                        <p className="font-bold text-ink hover:text-brand">
                          {o.title || `Teklif #${o.id}`}
                        </p>
                        <p className="text-xs text-ink/45">
                          {o.items.length} kalem · {fmtDateTime(o.createdAt)}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink/85">{o.customerName ?? "-"}</p>
                      {o.customerPhone && (
                        <p className="text-xs text-ink/45">{o.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-ink">{fmtMoney(o.total)}</td>
                    <td className="px-5 py-4">
                      <Select
                        value={o.status}
                        onChange={async (e) => {
                          try {
                            await api(`/api/offers/${o.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: e.target.value }),
                            });
                            await load();
                          } catch (err) {
                            setError((err as Error).message);
                          }
                        }}
                        className="w-36 py-1.5 text-xs"
                        aria-label="Durum"
                      >
                        {Object.keys(OFFER_STATUS_LABEL).map((s) => (
                          <option key={s} value={s}>
                            {OFFER_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink/55">
                      {o.sentDate ? fmtDate(o.sentDate) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewing(o)}
                          aria-label="Görüntüle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(o)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => remove(o)}
                            aria-label="Sil"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <Modal
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? "Teklifi Düzenle" : "Yeni Teklif"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlık">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 8 kamera + NVR teklifi"
                />
              </Field>
              <Field label="Müşteri">
                <CustomSelect
                  value={customerId}
                  onChange={setCustomerId}
                  options={customers.map((c) => ({
                    value: String(c.id),
                    label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}`,
                  }))}
                  placeholder="Müşteri seçin"
                />
              </Field>
            </div>

            <ItemsEditor
              items={items}
              onChange={setItems}
              products={products}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Durum">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {Object.keys(OFFER_STATUS_LABEL).map((s) => (
                    <option key={s} value={s}>
                      {OFFER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Gönderim tarihi">
                <Input
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              </div>
            </div>

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

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.title || `Teklif #${viewing.id}`} wide>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={viewing.status} labels={OFFER_STATUS_LABEL} />
              <p className="text-sm text-ink/55">
                {viewing.customerName ?? "Müşteri belirtilmedi"}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-ink/8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface text-xs font-bold uppercase tracking-wider text-ink/45">
                    <th className="px-4 py-2.5">Kalem</th>
                    <th className="px-4 py-2.5 text-center">Adet</th>
                    <th className="px-4 py-2.5 text-right">Birim</th>
                    <th className="px-4 py-2.5 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {viewing.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-ink/85">{i.name}</td>
                      <td className="px-4 py-2.5 text-center text-ink/70">{i.qty}</td>
                      <td className="px-4 py-2.5 text-right text-ink/70">
                        {fmtMoney(i.unitPrice)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink">
                        {fmtMoney(i.qty * i.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-ink/8 text-ink/60">
                    <td className="px-4 py-2" colSpan={3}>
                      Ara toplam
                    </td>
                    <td className="px-4 py-2 text-right">
                      {fmtMoney(viewing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))}
                    </td>
                  </tr>
                  <tr className="text-ink/60">
                    <td className="px-4 py-2" colSpan={3}>
                      KDV (%{viewing.taxRate})
                    </td>
                    <td className="px-4 py-2 text-right">
                      {fmtMoney(
                        Number(viewing.total) -
                          viewing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-ink/8 bg-surface font-bold text-ink">
                    <td className="px-4 py-3" colSpan={3}>
                      Genel toplam
                    </td>
                    <td className="px-4 py-3 text-right">{fmtMoney(viewing.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {viewing.note && (
              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-ink/70">
                {viewing.note}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}