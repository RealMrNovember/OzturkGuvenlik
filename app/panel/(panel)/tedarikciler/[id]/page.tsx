"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CurrencyAmountInput } from "@/components/panel/CurrencyAmountInput";
import {
  Badge,
  Btn,
  Card,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Textarea,
  fmtDate,
  fmtMoney,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

type Supplier = {
  id: number;
  name: string;
  phone: string;
  address: string;
  note: string;
};

type SupplierInvoice = {
  id: number;
  supplierId: number;
  invoiceNumber: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  status: "odenmedi" | "odendi";
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  note: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const blankInvoice = {
  invoiceNumber: "",
  amount: "",
  currency: "TRY",
  exchangeRate: 1,
  issueDate: today(),
  dueDate: "",
  note: "",
};

function isOverdue(inv: SupplierInvoice) {
  return inv.status !== "odendi" && !!inv.dueDate && inv.dueDate < today();
}

export default function TedarikciDetayPage() {
  const params = useParams<{ id: string }>();
  const supplierId = Number(params.id);
  const canDelete = usePanelCan("delete_records");

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blankInvoice);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(supplierId)) return;
    try {
      const [suppliersList, invoiceRows] = await Promise.all([
        api<Supplier[]>("/api/suppliers"),
        api<SupplierInvoice[]>(`/api/suppliers/${supplierId}/invoices`),
      ]);
      setSupplier(suppliersList.find((s) => s.id === supplierId) ?? null);
      setInvoices(invoiceRows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(blankInvoice);
    setCreating(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Tutar 0'dan büyük olmalı.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(`/api/suppliers/${supplierId}/invoices`, {
        method: "POST",
        body: JSON.stringify({ ...form, amount: Number(form.amount), dueDate: form.dueDate || null }),
      });
      setCreating(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (inv: SupplierInvoice) => {
    try {
      await api(`/api/suppliers/${supplierId}/invoices/${inv.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "odendi" }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (inv: SupplierInvoice) => {
    if (!confirm("Bu fatura silinsin mi?")) return;
    try {
      await api(`/api/suppliers/${supplierId}/invoices/${inv.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (!supplier) return <ErrorBox message={error || "Tedarikçi bulunamadı"} />;

  const unpaid = invoices.filter((i) => i.status !== "odendi");
  const balance = unpaid.reduce((s, i) => s + Number(i.amount) * Number(i.exchangeRate), 0);
  const overdueCount = unpaid.filter(isOverdue).length;

  return (
    <div className="space-y-5">
      <Link href="/panel/tedarikciler" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Tedarikçiler
      </Link>

      {error && <ErrorBox message={error} />}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{supplier.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/60">
            {supplier.phone && <span>{supplier.phone}</span>}
            {supplier.address && <span>{supplier.address}</span>}
          </div>
          {supplier.note && <p className="mt-2 text-sm text-ink/50">{supplier.note}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Ödenmemiş borç</p>
          <p className="mt-1 text-2xl font-black text-ink">{fmtMoney(balance)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Vadesi geçen fatura</p>
          <p className={`mt-1 text-2xl font-black ${overdueCount > 0 ? "text-red-600" : "text-ink"}`}>
            {overdueCount}
          </p>
        </div>
      </div>

      <Card title={`Faturalar (${invoices.length})`}>
        <div className="flex justify-end px-5 pt-4">
          <Btn onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            Fatura ekle
          </Btn>
        </div>
        {invoices.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-ink/50">Henüz fatura eklenmedi.</div>
        ) : (
          <div className="mt-2 divide-y divide-ink/6">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {inv.invoiceNumber || `Fatura #${inv.id}`}{" "}
                    {fmtMoneyWithTry(inv.amount, inv.currency, inv.exchangeRate)}
                  </p>
                  <p className="text-xs text-ink/45">
                    Kesim: {fmtDate(inv.issueDate)}
                    {inv.dueDate ? ` · Vade: ${fmtDate(inv.dueDate)}` : ""}
                    {inv.paidDate ? ` · Ödendi: ${fmtDate(inv.paidDate)}` : ""}
                    {inv.note ? ` · ${inv.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.status === "odendi" ? (
                    <Badge tone="green">Ödendi</Badge>
                  ) : isOverdue(inv) ? (
                    <Badge tone="red">Vadesi geçti</Badge>
                  ) : (
                    <Badge tone="amber">Ödenmedi</Badge>
                  )}
                  {inv.status !== "odendi" && (
                    <Btn variant="ghost" onClick={() => markPaid(inv)}>
                      Ödendi işaretle
                    </Btn>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => remove(inv)}
                      aria-label="Sil"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {creating && (
        <Modal open onClose={() => setCreating(false)} title="Yeni Tedarikçi Faturası" wide>
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fatura no">
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                />
              </Field>
              <Field label="Tutar">
                <CurrencyAmountInput
                  amount={form.amount}
                  currency={form.currency}
                  exchangeRate={form.exchangeRate}
                  onChange={(patch) =>
                    setForm({
                      ...form,
                      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
                      ...(patch.currency !== undefined ? { currency: patch.currency } : {}),
                      ...(patch.exchangeRate !== undefined ? { exchangeRate: patch.exchangeRate } : {}),
                    })
                  }
                />
              </Field>
              <Field label="Kesim tarihi">
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </Field>
              <Field label="Vade tarihi">
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setCreating(false)}>
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
