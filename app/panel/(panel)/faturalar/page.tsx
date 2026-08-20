"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { ItemsEditor, emptyItem, type ItemForm, type ProductOption } from "@/components/panel/ItemsEditor";
import { CurrencyPicker } from "@/components/panel/CurrencyAmountInput";
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
  INVOICE_STATUS_LABEL,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

type InvoiceRow = {
  id: number;
  number: string;
  customerId: number | null;
  jobId: number | null;
  offerId: number | null;
  items: { name: string; qty: number; unitPrice: number; productId?: number | null }[];
  taxRate: string;
  total: string;
  currency: string;
  exchangeRate: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  note: string;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
  jobTitle: string | null;
};

type CustomerRow = { id: number; name: string; phone: string };
type JobRow = { id: number; title: string };

export default function FaturalarPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<InvoiceRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<InvoiceRow | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [currency, setCurrency] = useState("TRY");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);

  const load = useCallback(async () => {
    try {
      const [inv, custs, jobRows, prods] = await Promise.all([
        api<InvoiceRow[]>("/api/invoices"),
        api<CustomerRow[]>("/api/customers"),
        api<JobRow[]>("/api/jobs"),
        api<ProductOption[]>("/api/products"),
      ]);
      setRows(inv);
      setCustomers(custs);
      setJobs(jobRows);
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
    setCustomerId("");
    setJobId("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setNote("");
    setTaxRate("20");
    setCurrency("TRY");
    setExchangeRate(1);
    setItems([emptyItem()]);
  };

  const openCreate = () => {
    resetForm();
    setCreating(true);
  };

  const openEdit = (row: InvoiceRow) => {
    setCustomerId(row.customerId ? String(row.customerId) : "");
    setJobId(row.jobId ? String(row.jobId) : "");
    setIssueDate(row.issueDate);
    setDueDate(row.dueDate ?? "");
    setNote(row.note);
    setTaxRate(row.taxRate);
    setCurrency(row.currency ?? "TRY");
    setExchangeRate(Number(row.exchangeRate ?? 1));
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
      customerId: customerId ? Number(customerId) : null,
      jobId: jobId ? Number(jobId) : null,
      items: cleanItems,
      taxRate: Number(taxRate) || 0,
      currency,
      exchangeRate,
      issueDate,
      dueDate: dueDate || null,
      note,
    };
    try {
      if (editing) {
        await api(`/api/invoices/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/invoices", { method: "POST", body: JSON.stringify(payload) });
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

  const remove = async (row: InvoiceRow) => {
    if (!confirm(`${row.number} silinsin mi?`)) return;
    try {
      await api(`/api/invoices/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const setStatus = async (row: InvoiceRow, status: string) => {
    try {
      await api(`/api/invoices/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Faturalar</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} kayıt</p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Fatura
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Fatura yok" desc="Yeni fatura oluşturarak başlayın." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Fatura No</th>
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Tutar</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Vade</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((inv) => (
                  <tr key={inv.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setViewing(inv)} className="text-left">
                        <p className="font-bold text-ink hover:text-brand">{inv.number}</p>
                        <p className="text-xs text-ink/45">
                          {fmtDate(inv.issueDate)}
                          {inv.jobTitle ? ` · ${inv.jobTitle}` : ""}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink/85">{inv.customerName ?? "-"}</p>
                      {inv.customerPhone && (
                        <p className="text-xs text-ink/45">{inv.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-ink">
                      {fmtMoneyWithTry(inv.total, inv.currency, inv.exchangeRate)}
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={inv.status}
                        onChange={(e) => setStatus(inv, e.target.value)}
                        className="w-36 py-1.5 text-xs"
                        aria-label="Durum"
                      >
                        {Object.keys(INVOICE_STATUS_LABEL).map((s) => (
                          <option key={s} value={s}>
                            {INVOICE_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink/55">
                      {inv.dueDate ? fmtDate(inv.dueDate) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewing(inv)}
                          aria-label="Görüntüle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(inv)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(inv)}
                          aria-label="Sil"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
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
          title={editing ? `${editing.number} Düzenle` : "Yeni Fatura"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Field label="İlgili iş (opsiyonel)">
                <CustomSelect
                  value={jobId}
                  onChange={setJobId}
                  options={jobs.map((j) => ({ value: String(j.id), label: j.title || `İş #${j.id}` }))}
                  placeholder="İş seçin"
                />
              </Field>
              <Field label="Para birimi">
                <CurrencyPicker
                  currency={currency}
                  onChange={(patch) => {
                    setCurrency(patch.currency);
                    setExchangeRate(patch.exchangeRate);
                  }}
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
              <Field label="Düzenleme tarihi">
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </Field>
              <Field label="Vade tarihi">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
              </div>
            </div>

            <p className="rounded-xl bg-brand/5 px-4 py-3 text-xs text-ink/60">
              Fatura durumunu <strong>Ödendi</strong> yaptığınızda tahsilat otomatik olarak Kasa&apos;ya
              gelir kaydı olarak düşer — ayrıca elle girmenize gerek yok.
            </p>

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
        <Modal open onClose={() => setViewing(null)} title={viewing.number} wide>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge
                status={viewing.status}
                labels={INVOICE_STATUS_LABEL}
              />
              <p className="text-sm text-ink/55">{viewing.customerName ?? "Müşteri belirtilmedi"}</p>
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
                        {fmtMoney(i.unitPrice, viewing.currency)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ink">
                        {fmtMoney(i.qty * i.unitPrice, viewing.currency)}
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
                      {fmtMoney(viewing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0), viewing.currency)}
                    </td>
                  </tr>
                  <tr className="text-ink/60">
                    <td className="px-4 py-2" colSpan={3}>
                      KDV (%{viewing.taxRate})
                    </td>
                    <td className="px-4 py-2 text-right">
                      {fmtMoney(
                        Number(viewing.total) -
                          viewing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
                        viewing.currency
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-ink/8 bg-surface font-bold text-ink">
                    <td className="px-4 py-3" colSpan={3}>
                      Genel toplam
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fmtMoneyWithTry(viewing.total, viewing.currency, viewing.exchangeRate)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-ink/50">
              <span>Düzenleme: {fmtDate(viewing.issueDate)}</span>
              {viewing.dueDate && <span>Vade: {fmtDate(viewing.dueDate)}</span>}
              {viewing.paidDate && <span>Ödeme: {fmtDate(viewing.paidDate)}</span>}
              <span>Oluşturma: {fmtDateTime(viewing.createdAt)}</span>
            </div>
            {viewing.note && (
              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-ink/70">{viewing.note}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
