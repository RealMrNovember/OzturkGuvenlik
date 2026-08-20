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
  Select,
  Textarea,
  fmtDate,
  fmtDateTime,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

type StaffRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialty: string;
  active: boolean;
};

type LeaveRow = {
  id: number;
  userId: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  note: string;
  createdAt: string;
};

type NoteRow = {
  id: number;
  userId: number;
  note: string;
  createdAt: string;
  authorName: string | null;
};

type TransactionRow = {
  id: number;
  type: string;
  category: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  date: string;
  description: string;
  staffId: number | null;
};

const LEAVE_TYPE_LABEL: Record<string, string> = {
  yillik: "Yıllık İzin",
  hastalik: "Hastalık İzni",
  ucretsiz: "Ücretsiz İzin",
  diger: "Diğer",
};

const LEAVE_STATUS_LABEL: Record<string, string> = {
  bekliyor: "Bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

const TX_CATEGORY_LABEL: Record<string, string> = {
  "personel-maasi": "Maaş",
  "personel-masrafi": "Masraf",
  "personel-primi": "Prim",
};

const blankLeave = { type: "yillik", startDate: "", endDate: "", status: "bekliyor", note: "" };

export default function PersonelDetayPage() {
  const params = useParams<{ id: string }>();
  const staffId = Number(params.id);
  const canManageStaff = usePanelCan("manage_staff");

  const [staff, setStaff] = useState<StaffRow | null>(null);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [creatingLeave, setCreatingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState(blankLeave);

  const [noteText, setNoteText] = useState("");

  const [txCreating, setTxCreating] = useState(false);
  const [txCategory, setTxCategory] = useState("personel-masrafi");
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState("TRY");
  const [txExchangeRate, setTxExchangeRate] = useState(1);
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txDescription, setTxDescription] = useState("");

  const load = useCallback(async () => {
    if (!Number.isInteger(staffId)) return;
    try {
      const [staffList, l, n, t] = await Promise.all([
        api<StaffRow[]>("/api/staff"),
        api<LeaveRow[]>(`/api/staff/${staffId}/leaves`),
        api<NoteRow[]>(`/api/staff/${staffId}/notes`),
        api<TransactionRow[]>(`/api/transactions?staffId=${staffId}`),
      ]);
      setStaff(staffList.find((s) => s.id === staffId) ?? null);
      setLeaves(l);
      setNotes(n);
      setTransactions(t);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const addLeave = async (e: FormEvent) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      setError("Başlangıç ve bitiş tarihi gerekli.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api(`/api/staff/${staffId}/leaves`, { method: "POST", body: JSON.stringify(leaveForm) });
      setLeaveForm(blankLeave);
      setCreatingLeave(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const setLeaveStatus = async (leaveId: number, status: string) => {
    try {
      await api(`/api/staff/${staffId}/leaves/${leaveId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeLeave = async (leaveId: number) => {
    if (!confirm("Bu izin kaydı silinsin mi?")) return;
    try {
      await api(`/api/staff/${staffId}/leaves/${leaveId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api(`/api/staff/${staffId}/notes`, { method: "POST", body: JSON.stringify({ note: noteText }) });
      setNoteText("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async (noteId: number) => {
    if (!confirm("Bu not silinsin mi?")) return;
    try {
      await api(`/api/staff/${staffId}/notes/${noteId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addTransaction = async (e: FormEvent) => {
    e.preventDefault();
    if (!txAmount || Number(txAmount) <= 0) {
      setError("Tutar 0'dan büyük olmalı.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: "gider",
          category: txCategory,
          amount: Number(txAmount),
          currency: txCurrency,
          exchangeRate: txExchangeRate,
          date: txDate,
          method: "nakit",
          description: txDescription,
          staffId,
        }),
      });
      setTxAmount("");
      setTxDescription("");
      setTxCreating(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!canManageStaff) {
    return <ErrorBox message="Bu sayfa için personel yönetimi yetkisi gerekli." />;
  }
  if (loading) return <Loading />;
  if (!staff) return <ErrorBox message="Personel bulunamadı." />;

  return (
    <div className="space-y-5">
      <div>
        <Link href="/panel/personel" className="text-xs font-semibold text-brand">
          ← Personel
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{staff.name}</h1>
        <p className="mt-1 text-sm text-ink/55">
          {staff.email}
          {staff.phone ? ` · ${staff.phone}` : ""}
          {staff.specialty ? ` · ${staff.specialty}` : ""}
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <Card
        title="İzinler"
        action={
          <Btn variant="ghost" onClick={() => setCreatingLeave(true)}>
            <Icon name="plus" className="h-4 w-4" />
            İzin Ekle
          </Btn>
        }
      >
        {leaves.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink/50">Henüz izin kaydı yok.</div>
        ) : (
          leaves.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="gray">{LEAVE_TYPE_LABEL[l.type] ?? l.type}</Badge>
                  <Badge tone={l.status === "onaylandi" ? "green" : l.status === "reddedildi" ? "red" : "amber"}>
                    {LEAVE_STATUS_LABEL[l.status] ?? l.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink/80">
                  {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                </p>
                {l.note && <p className="mt-0.5 text-xs text-ink/50">{l.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {l.status === "bekliyor" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setLeaveStatus(l.id, "onaylandi")}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Onayla
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveStatus(l.id, "reddedildi")}
                      className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeLeave(l.id)}
                  aria-label="Sil"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Card
        title="Masraf & Prim"
        action={
          <Btn variant="ghost" onClick={() => setTxCreating(true)}>
            <Icon name="plus" className="h-4 w-4" />
            Kayıt Ekle
          </Btn>
        }
      >
        {transactions.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink/50">Henüz masraf/prim kaydı yok.</div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{TX_CATEGORY_LABEL[t.category] ?? t.category}</p>
                <p className="text-xs text-ink/45">
                  {fmtDate(t.date)}
                  {t.description ? ` · ${t.description}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-bold text-ink">
                {fmtMoneyWithTry(t.amount, t.currency, t.exchangeRate)}
              </p>
            </div>
          ))
        )}
      </Card>

      <Card title="Notlar">
        <form onSubmit={addNote} className="flex flex-wrap items-start gap-2.5 px-5 py-4">
          <Textarea
            rows={1}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Performans notu, geri bildirim…"
            className="min-w-[200px] flex-1"
          />
          <Btn type="submit" disabled={saving || !noteText.trim()}>
            Ekle
          </Btn>
        </form>
        {notes.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink/50">Henüz not yok.</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <span className="text-xs text-ink/40">
                  {fmtDateTime(n.createdAt)}
                  {n.authorName ? ` · ${n.authorName}` : ""}
                </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{n.note}</p>
              </div>
              <button
                type="button"
                onClick={() => removeNote(n.id)}
                aria-label="Sil"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </Card>

      {creatingLeave && (
        <Modal open onClose={() => setCreatingLeave(false)} title="İzin Ekle">
          <form onSubmit={addLeave} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <Field label="İzin türü">
              <Select
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              >
                {Object.keys(LEAVE_TYPE_LABEL).map((t) => (
                  <option key={t} value={t}>
                    {LEAVE_TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlangıç">
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                />
              </Field>
              <Field label="Bitiş">
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Durum">
              <Select
                value={leaveForm.status}
                onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
              >
                {Object.keys(LEAVE_STATUS_LABEL).map((s) => (
                  <option key={s} value={s}>
                    {LEAVE_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Not (opsiyonel)">
              <Textarea
                rows={2}
                value={leaveForm.note}
                onChange={(e) => setLeaveForm({ ...leaveForm, note: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setCreatingLeave(false)}>
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {txCreating && (
        <Modal open onClose={() => setTxCreating(false)} title="Masraf / Prim Kaydı Ekle">
          <form onSubmit={addTransaction} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <Field label="Tür">
              <Select value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                <option value="personel-masrafi">Masraf</option>
                <option value="personel-primi">Prim</option>
                <option value="personel-maasi">Maaş</option>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tutar">
                <CurrencyAmountInput
                  amount={txAmount}
                  currency={txCurrency}
                  exchangeRate={txExchangeRate}
                  onChange={(patch) => {
                    if (patch.amount !== undefined) setTxAmount(patch.amount);
                    if (patch.currency !== undefined) setTxCurrency(patch.currency);
                    if (patch.exchangeRate !== undefined) setTxExchangeRate(patch.exchangeRate);
                  }}
                />
              </Field>
              <Field label="Tarih">
                <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Açıklama">
              <Textarea
                rows={2}
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                placeholder="Örn: Yakıt masrafı, Ekim ayı performans primi"
              />
            </Field>
            <p className="text-xs text-ink/40">Bu kayıt otomatik olarak Kasa'ya gider olarak işlenir.</p>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setTxCreating(false)}>
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
