"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import {
  Badge,
  Btn,
  Card,
  ErrorBox,
  Input,
  Loading,
  Select,
  StatusBadge,
  Textarea,
  REQUEST_STATUS_LABEL,
  APPOINTMENT_STATUS_LABEL,
  OFFER_STATUS_LABEL,
  JOB_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  SOURCE_LABEL,
  CUSTOMER_NOTE_CHANNEL_LABEL,
  fmtDate,
  fmtDateTime,
  fmtMoney,
} from "@/components/panel/ui";

type Customer = {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  placeType: string;
  address: string;
  contacts: { name: string; phone: string; title: string }[];
  locations: { label: string; address: string }[];
  note: string;
  source: string;
  createdAt: string;
};

type NoteRow = {
  id: number;
  channel: string;
  note: string;
  createdAt: string;
  authorName: string | null;
};

type RequestRow = { id: number; customerId: number | null; name: string; placeType: string; status: string; createdAt: string };
type AppointmentRow = { id: number; customerId: number | null; title: string; date: string; time: string; status: string };
type OfferRow = { id: number; customerId: number | null; title: string; total: string; status: string; createdAt: string };
type JobRow = { id: number; customerId: number | null; title: string; status: string; saleTotal: string; costTotal?: string; startDate: string | null; endDate: string | null };
type InvoiceRow = { id: number; customerId: number | null; number: string; total: string; status: string; issueDate: string };
type TransactionRow = { id: number; customerId: number | null; type: string; amount: string; date: string; description: string };

export default function MusteriDetayPage() {
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);
  const canDelete = usePanelCan("delete_records");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contactForm, setContactForm] = useState({ name: "", phone: "", title: "" });
  const [locationForm, setLocationForm] = useState({ label: "", address: "" });
  const [noteChannel, setNoteChannel] = useState("telefon");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(customerId)) return;
    try {
      const [c, n, r, a, o, j, i, t] = await Promise.all([
        api<Customer>(`/api/customers/${customerId}`),
        api<NoteRow[]>(`/api/customers/${customerId}/notes`),
        api<RequestRow[]>("/api/requests"),
        api<AppointmentRow[]>("/api/appointments"),
        api<OfferRow[]>("/api/offers"),
        api<JobRow[]>("/api/jobs"),
        api<InvoiceRow[]>("/api/invoices"),
        api<TransactionRow[]>("/api/transactions"),
      ]);
      setCustomer(c);
      setNotes(n);
      setRequests(r.filter((x) => x.customerId === customerId));
      setAppointments(a.filter((x) => x.customerId === customerId));
      setOffers(o.filter((x) => x.customerId === customerId));
      setJobs(j.filter((x) => x.customerId === customerId));
      setInvoices(i.filter((x) => x.customerId === customerId));
      setTransactions(t.filter((x) => x.customerId === customerId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const addContact = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer || !contactForm.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const contacts = [...customer.contacts, contactForm];
      await api(`/api/customers/${customerId}`, { method: "PATCH", body: JSON.stringify({ contacts }) });
      setContactForm({ name: "", phone: "", title: "" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const removeContact = async (idx: number) => {
    if (!customer) return;
    try {
      const contacts = customer.contacts.filter((_, i) => i !== idx);
      await api(`/api/customers/${customerId}`, { method: "PATCH", body: JSON.stringify({ contacts }) });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addLocation = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer || !locationForm.address.trim()) return;
    setSaving(true);
    setError("");
    try {
      const locations = [...customer.locations, locationForm];
      await api(`/api/customers/${customerId}`, { method: "PATCH", body: JSON.stringify({ locations }) });
      setLocationForm({ label: "", address: "" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (idx: number) => {
    if (!customer) return;
    try {
      const locations = customer.locations.filter((_, i) => i !== idx);
      await api(`/api/customers/${customerId}`, { method: "PATCH", body: JSON.stringify({ locations }) });
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
      await api(`/api/customers/${customerId}/notes`, {
        method: "POST",
        body: JSON.stringify({ channel: noteChannel, note: noteText.trim() }),
      });
      setNoteText("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async (noteId: number) => {
    if (!confirm("Not silinsin mi?")) return;
    try {
      await api(`/api/customers/${customerId}/notes/${noteId}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (!customer) return <ErrorBox message={error || "Müşteri bulunamadı"} />;

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalCollected = transactions
    .filter((t) => t.type === "gelir")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-5">
      <Link href="/panel/musteriler" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Müşteriler
      </Link>

      {error && <ErrorBox message={error} />}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{customer.name}</h1>
            <Badge tone="gray">{SOURCE_LABEL[customer.source] ?? customer.source}</Badge>
            {customer.placeType && <Badge tone="gray">{customer.placeType}</Badge>}
          </div>
          {customer.contactName && (
            <p className="mt-1 text-sm font-semibold text-ink/60">Yetkili: {customer.contactName}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/60">
            {customer.phone && (
              <a href={`tel:+${customer.phone.replace(/\D/g, "")}`} className="font-semibold text-brand hover:underline">
                {customer.phone}
              </a>
            )}
            {customer.address && <span>{customer.address}</span>}
          </div>
          {customer.note && <p className="mt-3 max-w-xl text-sm text-ink/70">{customer.note}</p>}
        </div>
        <Link href={`/panel/musteriler?edit=${customer.id}`}>
          <Btn variant="ghost">
            <Icon name="pen" className="h-4 w-4" />
            Temel bilgileri düzenle
          </Btn>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Toplam fatura</p>
          <p className="mt-1 text-2xl font-black text-ink">{fmtMoney(totalInvoiced)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Toplam tahsilat</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{fmtMoney(totalCollected)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Bakiye</p>
          <p
            className={`mt-1 text-2xl font-black ${totalInvoiced - totalCollected > 0 ? "text-red-500" : "text-ink"}`}
          >
            {fmtMoney(totalInvoiced - totalCollected)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Yetkili kişiler">
          {customer.contacts.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Henüz yetkili kişi eklenmedi.</div>
          ) : (
            customer.contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-xs text-ink/50">
                    {c.title || "-"}
                    {c.phone ? ` · ${c.phone}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  aria-label="Kaldır"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
          <form onSubmit={addContact} className="flex flex-wrap items-center gap-2 px-5 py-3.5">
            <Input
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="Ad Soyad"
              className="w-32 flex-1"
            />
            <Input
              value={contactForm.title}
              onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
              placeholder="Unvan"
              className="w-28"
            />
            <Input
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              placeholder="Telefon"
              className="w-32"
            />
            <Btn type="submit" variant="ghost" disabled={saving}>
              <Icon name="plus" className="h-4 w-4" />
              Ekle
            </Btn>
          </form>
        </Card>

        <Card title="Lokasyonlar">
          {customer.locations.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">
              Ana adres dışında lokasyon eklenmedi.
            </div>
          ) : (
            customer.locations.map((l, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{l.label || "Lokasyon"}</p>
                  <p className="truncate text-xs text-ink/50">{l.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeLocation(idx)}
                  aria-label="Kaldır"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
          <form onSubmit={addLocation} className="flex flex-wrap items-center gap-2 px-5 py-3.5">
            <Input
              value={locationForm.label}
              onChange={(e) => setLocationForm({ ...locationForm, label: e.target.value })}
              placeholder="Etiket (örn: Şube 2)"
              className="w-32"
            />
            <Input
              value={locationForm.address}
              onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
              placeholder="Adres"
              className="w-40 flex-1"
            />
            <Btn type="submit" variant="ghost" disabled={saving}>
              <Icon name="plus" className="h-4 w-4" />
              Ekle
            </Btn>
          </form>
        </Card>
      </div>

      <Card title="Görüşme notları">
        <form onSubmit={addNote} className="flex flex-wrap items-start gap-2.5 px-5 py-4">
          <Select
            value={noteChannel}
            onChange={(e) => setNoteChannel(e.target.value)}
            className="w-32"
            aria-label="Kanal"
          >
            {Object.keys(CUSTOMER_NOTE_CHANNEL_LABEL).map((c) => (
              <option key={c} value={c}>
                {CUSTOMER_NOTE_CHANNEL_LABEL[c]}
              </option>
            ))}
          </Select>
          <Textarea
            rows={1}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Görüşme özeti…"
            className="min-w-[200px] flex-1"
          />
          <Btn type="submit" disabled={saving || !noteText.trim()}>
            Ekle
          </Btn>
        </form>
        {notes.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink/50">Henüz görüşme notu yok.</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone="gray">{CUSTOMER_NOTE_CHANNEL_LABEL[n.channel] ?? n.channel}</Badge>
                  <span className="text-xs text-ink/40">
                    {fmtDateTime(n.createdAt)}
                    {n.authorName ? ` · ${n.authorName}` : ""}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{n.note}</p>
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => removeNote(n.id)}
                  aria-label="Sil"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Keşif talepleri">
          {requests.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            requests.map((r) => (
              <Link key={r.id} href={`/panel/talepler#talep-${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/2">
                <span className="truncate text-sm text-ink/80">
                  {r.placeType || "-"} · {fmtDate(r.createdAt.slice(0, 10))}
                </span>
                <StatusBadge status={r.status} labels={REQUEST_STATUS_LABEL} />
              </Link>
            ))
          )}
        </Card>

        <Card title="Randevular">
          {appointments.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            appointments.map((a) => (
              <Link key={a.id} href="/panel/randevular" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/2">
                <span className="truncate text-sm text-ink/80">
                  {a.title || "Randevu"} · {fmtDate(a.date)} {a.time}
                </span>
                <StatusBadge status={a.status} labels={APPOINTMENT_STATUS_LABEL} />
              </Link>
            ))
          )}
        </Card>

        <Card title="Teklifler">
          {offers.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            offers.map((o) => (
              <Link key={o.id} href="/panel/teklifler" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/2">
                <span className="truncate text-sm text-ink/80">{o.title || `Teklif #${o.id}`}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{fmtMoney(o.total)}</span>
                  <StatusBadge status={o.status} labels={OFFER_STATUS_LABEL} />
                </div>
              </Link>
            ))
          )}
        </Card>

        <Card title="İşler">
          {jobs.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            jobs.map((j) => (
              <Link key={j.id} href="/panel/isler" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/2">
                <span className="truncate text-sm text-ink/80">{j.title || `İş #${j.id}`}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{fmtMoney(j.saleTotal)}</span>
                  <StatusBadge status={j.status} labels={JOB_STATUS_LABEL} />
                </div>
              </Link>
            ))
          )}
        </Card>

        <Card title="Faturalar">
          {invoices.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            invoices.map((i) => (
              <Link key={i.id} href="/panel/faturalar" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ink/2">
                <span className="truncate text-sm text-ink/80">{i.number}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">{fmtMoney(i.total)}</span>
                  <StatusBadge status={i.status} labels={INVOICE_STATUS_LABEL} />
                </div>
              </Link>
            ))
          )}
        </Card>

        <Card title="Kasa hareketleri">
          {transactions.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink/50">Kayıt yok.</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="truncate text-sm text-ink/80">
                  {t.description || "-"} · {fmtDate(t.date)}
                </span>
                <span className={`text-sm font-bold ${t.type === "gelir" ? "text-emerald-600" : "text-red-500"}`}>
                  {t.type === "gelir" ? "+" : "-"}
                  {fmtMoney(t.amount)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
