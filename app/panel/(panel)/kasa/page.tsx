"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { CurrencyAmountInput } from "@/components/panel/CurrencyAmountInput";
import {
  Btn,
  Card,
  EmptyState,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  Textarea,
  fmtDate,
  fmtMoney,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

const CATEGORY_LABEL: Record<string, string> = {
  "is-tahsilati": "İş tahsilatı",
  "diger-gelir": "Diğer gelir",
  malzeme: "Malzeme",
  "yakit-ulasim": "Yakıt / Ulaşım",
  "personel-maasi": "Personel maaşı",
  "personel-masrafi": "Personel masrafı",
  "personel-primi": "Personel primi",
  kira: "Kira",
  "fatura-abonelik": "Fatura / Abonelik",
  "diger-gider": "Diğer gider",
};

const STAFF_CATEGORIES = ["personel-maasi", "personel-masrafi", "personel-primi"];

const INCOME_CATEGORIES = ["is-tahsilati", "diger-gelir"];
const EXPENSE_CATEGORIES = [
  "malzeme",
  "yakit-ulasim",
  "personel-maasi",
  "personel-masrafi",
  "personel-primi",
  "kira",
  "fatura-abonelik",
  "diger-gider",
];

const METHOD_LABEL: Record<string, string> = {
  nakit: "Nakit",
  havale: "Havale/EFT",
  kart: "Kart",
};

type TxRow = {
  id: number;
  type: "gelir" | "gider";
  category: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  date: string;
  method: string;
  description: string;
  jobId: number | null;
  customerId: number | null;
  invoiceId: number | null;
  staffId: number | null;
  createdAt: string;
  customerName: string | null;
  jobTitle: string | null;
  staffName: string | null;
};

type StaffRow = { id: number; name: string };

export default function KasaPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";

  const [rows, setRows] = useState<TxRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"hepsi" | "gelir" | "gider">("hepsi");

  const [type, setType] = useState<"gelir" | "gider">("gelir");
  const [category, setCategory] = useState("is-tahsilati");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState("nakit");
  const [description, setDescription] = useState("");
  const [staffId, setStaffId] = useState("");

  const load = useCallback(async () => {
    try {
      const [tx, staffList] = await Promise.all([
        api<TxRow[]>("/api/transactions"),
        api<StaffRow[]>("/api/staff"),
      ]);
      setRows(tx);
      setStaff(staffList);
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

  const summary = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonth = rows.filter((r) => r.date.startsWith(monthKey));
    const income = thisMonth
      .filter((r) => r.type === "gelir")
      .reduce((s, r) => s + Number(r.amount) * Number(r.exchangeRate), 0);
    const expense = thisMonth
      .filter((r) => r.type === "gider")
      .reduce((s, r) => s + Number(r.amount) * Number(r.exchangeRate), 0);
    return { income, expense, net: income - expense };
  }, [rows]);

  const visibleRows = rows.filter((r) => filter === "hepsi" || r.type === filter);

  const resetForm = () => {
    setType("gelir");
    setCategory("is-tahsilati");
    setAmount("");
    setCurrency("TRY");
    setExchangeRate(1);
    setDate(new Date().toISOString().slice(0, 10));
    setMethod("nakit");
    setDescription("");
    setStaffId("");
  };

  const openCreate = (initialType: "gelir" | "gider") => {
    resetForm();
    setType(initialType);
    setCategory(initialType === "gelir" ? "is-tahsilati" : "malzeme");
    setCreating(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Tutar 0'dan büyük olmalı.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          type,
          category,
          amount: Number(amount),
          currency,
          exchangeRate,
          date,
          method,
          description,
          staffId: STAFF_CATEGORIES.includes(category) && staffId ? Number(staffId) : null,
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

  const remove = async (row: TxRow) => {
    if (!confirm("Bu kayıt silinsin mi?")) return;
    try {
      await api(`/api/transactions/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Kasa</h1>
          <p className="mt-1 text-sm text-ink/55">Gelir ve gider takibi</p>
        </div>
        <div className="flex gap-2.5">
          <Btn variant="ghost" onClick={() => openCreate("gider")}>
            <Icon name="plus" className="h-4 w-4" />
            Gider ekle
          </Btn>
          <Btn onClick={() => openCreate("gelir")}>
            <Icon name="plus" className="h-4 w-4" />
            Gelir ekle
          </Btn>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Bu ay gelir</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{fmtMoney(summary.income)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Bu ay gider</p>
          <p className="mt-1 text-2xl font-black text-red-500">{fmtMoney(summary.expense)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Bu ay net</p>
          <p className={`mt-1 text-2xl font-black ${summary.net >= 0 ? "text-ink" : "text-red-500"}`}>
            {fmtMoney(summary.net)}
          </p>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="flex gap-2">
        {(["hepsi", "gelir", "gider"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f ? "bg-ink text-white" : "bg-white text-ink/60 hover:bg-ink/5"
            }`}
          >
            {f === "hepsi" ? "Hepsi" : f === "gelir" ? "Gelir" : "Gider"}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : visibleRows.length === 0 ? (
        <EmptyState title="Kayıt yok" desc="Gelir veya gider ekleyerek başlayın." />
      ) : (
        <Card>
          {visibleRows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {r.description || CATEGORY_LABEL[r.category] || r.category}
                </p>
                <p className="text-xs text-ink/45">
                  {fmtDate(r.date)} · {CATEGORY_LABEL[r.category] ?? r.category} ·{" "}
                  {METHOD_LABEL[r.method] ?? r.method}
                  {r.customerName ? ` · ${r.customerName}` : ""}
                  {r.jobTitle ? ` · ${r.jobTitle}` : ""}
                  {r.staffName ? ` · ${r.staffName}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <p
                  className={`font-bold ${r.type === "gelir" ? "text-emerald-600" : "text-red-500"}`}
                >
                  {r.type === "gelir" ? "+" : "-"}
                  {fmtMoneyWithTry(r.amount, r.currency, r.exchangeRate)}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    aria-label="Sil"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {creating && (
        <Modal open onClose={() => setCreating(false)} title={type === "gelir" ? "Gelir Ekle" : "Gider Ekle"}>
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
              {(["gelir", "gider"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory(t === "gelir" ? "is-tahsilati" : "malzeme");
                  }}
                  className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                    type === t ? "bg-white text-ink shadow-sm" : "text-ink/50"
                  }`}
                >
                  {t === "gelir" ? "Gelir" : "Gider"}
                </button>
              ))}
            </div>

            <Field label="Kategori">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {(type === "gelir" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>

            {STAFF_CATEGORIES.includes(category) && (
              <Field label="Personel">
                <CustomSelect
                  value={staffId}
                  onChange={setStaffId}
                  options={staff.map((s) => ({ value: String(s.id), label: s.name }))}
                  placeholder="Personel seçin"
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tutar">
                <CurrencyAmountInput
                  amount={amount}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  onChange={(patch) => {
                    if (patch.amount !== undefined) setAmount(patch.amount);
                    if (patch.currency !== undefined) setCurrency(patch.currency);
                    if (patch.exchangeRate !== undefined) setExchangeRate(patch.exchangeRate);
                  }}
                />
              </Field>
              <Field label="Tarih">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>

            <Field label="Ödeme yöntemi">
              <CustomSelect
                value={method}
                onChange={setMethod}
                options={Object.entries(METHOD_LABEL).map(([value, label]) => ({ value, label }))}
              />
            </Field>

            <Field label="Açıklama">
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: 8 kamera montaj malzemesi"
              />
            </Field>

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
