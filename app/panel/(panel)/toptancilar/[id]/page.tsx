"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CurrencyAmountInput, CurrencyPicker } from "@/components/panel/CurrencyAmountInput";
import { ItemsEditor, emptyItem, type ItemForm, type ProductOption } from "@/components/panel/ItemsEditor";
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
  taxOffice: string;
  taxNumber: string;
  paymentTermDays: number | null;
  note: string;
};

type SupplierInvoice = {
  id: number;
  supplierId: number;
  invoiceNumber: string;
  items: { name: string; qty: number; unitPrice: number; productId?: number | null }[];
  taxRate: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  status: "odenmedi" | "odendi";
  received: boolean;
  receivedAt: string | null;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  note: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const blankInvoice = {
  invoiceNumber: "",
  items: [] as ItemForm[],
  taxRate: "20",
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

export default function ToptanciDetayPage() {
  const params = useParams<{ id: string }>();
  const supplierId = Number(params.id);
  const canDelete = usePanelCan("delete_records");

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blankInvoice);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(supplierId)) return;
    try {
      const [suppliersList, invoiceRows, productRows] = await Promise.all([
        api<Supplier[]>("/api/suppliers"),
        api<SupplierInvoice[]>(`/api/suppliers/${supplierId}/invoices`),
        api<ProductOption[]>("/api/products"),
      ]);
      setSupplier(suppliersList.find((s) => s.id === supplierId) ?? null);
      setInvoices(invoiceRows);
      setProducts(productRows);
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
    const hasItems = form.items.length > 0;
    if (!hasItems && (!form.amount || Number(form.amount) <= 0)) {
      setError("Ya kalem ekleyin ya da 0'dan büyük bir toplam tutar girin.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(`/api/suppliers/${supplierId}/invoices`, {
        method: "POST",
        body: JSON.stringify({
          invoiceNumber: form.invoiceNumber,
          items: form.items.map((i) => ({
            name: i.name,
            qty: Number(i.qty) || 0,
            unitPrice: Number(i.unitPrice) || 0,
            productId: i.productId ?? null,
          })),
          taxRate: Number(form.taxRate) || 0,
          amount: hasItems ? undefined : Number(form.amount),
          currency: form.currency,
          exchangeRate: form.exchangeRate,
          issueDate: form.issueDate,
          dueDate: form.dueDate || null,
          note: form.note,
        }),
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

  const markReceived = async (inv: SupplierInvoice) => {
    try {
      const res = await api<{ needsSerialEntry: number[] }>(
        `/api/suppliers/${supplierId}/invoices/${inv.id}`,
        { method: "PATCH", body: JSON.stringify({ received: true }) }
      );
      if (res.needsSerialEntry.length > 0) {
        setNotice(
          `Stok girildi. ${res.needsSerialEntry.length} kalem seri numaralı ürün — bunlar için Ürünler sayfasından seri numarası eklemeniz gerekiyor.`
        );
      } else {
        setNotice("Kalemler stoğa işlendi.");
      }
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
  if (!supplier) return <ErrorBox message={error || "Toptancı bulunamadı"} />;

  const unpaid = invoices.filter((i) => i.status !== "odendi");
  const balance = unpaid.reduce((s, i) => s + Number(i.amount) * Number(i.exchangeRate), 0);
  const overdueCount = unpaid.filter(isOverdue).length;
  const hasItems = form.items.length > 0;

  return (
    <div className="space-y-5">
      <Link href="/panel/toptancilar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Toptancılar
      </Link>

      {error && <ErrorBox message={error} />}
      {notice && <p className="rounded-xl bg-brand/5 px-4 py-3 text-sm text-ink/70">{notice}</p>}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{supplier.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/60">
            {supplier.phone && <span>{supplier.phone}</span>}
            {supplier.address && <span>{supplier.address}</span>}
            {supplier.taxNumber && (
              <span>
                VN: {supplier.taxNumber}
                {supplier.taxOffice ? ` (${supplier.taxOffice})` : ""}
              </span>
            )}
            {supplier.paymentTermDays != null && <span>Vade: {supplier.paymentTermDays} gün</span>}
          </div>
          {supplier.note && <p className="mt-2 text-sm text-ink/50">{supplier.note}</p>}
        </div>
        <Link href={`/panel/toptancilar?edit=${supplier.id}`}>
          <Btn variant="ghost">
            <Icon name="pen" className="h-4 w-4" />
            Düzenle
          </Btn>
        </Link>
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
                    {inv.items.length > 0
                      ? ` · ${inv.items.length} kalem (${inv.items.reduce((s, i) => s + i.qty, 0)} adet)`
                      : ""}
                    {inv.note ? ` · ${inv.note}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {inv.status === "odendi" ? (
                    <Badge tone="green">Ödendi</Badge>
                  ) : isOverdue(inv) ? (
                    <Badge tone="red">Vadesi geçti</Badge>
                  ) : (
                    <Badge tone="amber">Ödenmedi</Badge>
                  )}
                  {inv.received ? (
                    <Badge tone="brand">Teslim alındı</Badge>
                  ) : (
                    inv.items.length > 0 && (
                      <Btn variant="ghost" onClick={() => markReceived(inv)}>
                        Teslim alındı — stoğa işle
                      </Btn>
                    )
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
        <Modal open onClose={() => setCreating(false)} title="Yeni Toptancı Faturası" wide>
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fatura/proforma/makbuz no">
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                />
              </Field>
              <Field label="Para birimi">
                <CurrencyPicker
                  currency={form.currency}
                  onChange={(patch) => setForm({ ...form, currency: patch.currency, exchangeRate: patch.exchangeRate })}
                />
              </Field>
            </div>

            <ItemsEditor
              items={form.items}
              onChange={(items) => setForm({ ...form, items })}
              products={products}
              taxRate={form.taxRate}
              onTaxRateChange={(taxRate) => setForm({ ...form, taxRate })}
              priceField="costPrice"
            />
            {form.items.length === 0 && (
              <button
                type="button"
                onClick={() => setForm({ ...form, items: [emptyItem()] })}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Kalem eklemek yerine yalnızca toplam tutar girmek için tıklayın →
              </button>
            )}
            {!hasItems && (
              <Field label="Toplam tutar (kalemsiz — makbuz gibi basit belgeler için)">
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
            )}

            <div className="grid gap-4 sm:grid-cols-2">
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
