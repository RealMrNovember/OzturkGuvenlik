"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import {
  Btn,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  StatusBadge,
  Textarea,
  APPOINTMENT_STATUS_LABEL,
  APPOINTMENT_TYPE_LABEL,
  fmtDate,
} from "@/components/panel/ui";

type AppointmentRow = {
  id: number;
  customerId: number | null;
  requestId: number | null;
  title: string;
  type: string;
  date: string;
  time: string;
  address: string;
  note: string;
  status: string;
  assignedTo: number | null;
  customerName: string | null;
  customerPhone: string | null;
  assignedName: string | null;
};

type CustomerRow = { id: number; name: string; phone: string };
type StaffRow = { id: number; name: string };

const blank = {
  title: "",
  type: "kesif",
  date: new Date().toISOString().slice(0, 10),
  time: "10:00",
  address: "",
  note: "",
  status: "planlandi",
  customerId: null as number | null,
  requestId: null as number | null,
  assignedTo: null as number | null,
};

export default function RandevularPage() {
  const canDelete = usePanelCan("delete_records");

  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AppointmentRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [appts, custs, staffList] = await Promise.all([
        api<AppointmentRow[]>("/api/appointments"),
        api<CustomerRow[]>("/api/customers"),
        api<StaffRow[]>("/api/staff"),
      ]);
      setRows(appts);
      setCustomers(custs);
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

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
  };

  const openEdit = (row: AppointmentRow) => {
    setForm({
      title: row.title,
      type: row.type,
      date: row.date,
      time: row.time,
      address: row.address,
      note: row.note,
      status: row.status,
      customerId: row.customerId,
      requestId: row.requestId,
      assignedTo: row.assignedTo,
    });
    setEditing(row);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api(`/api/appointments/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await api("/api/appointments", {
          method: "POST",
          body: JSON.stringify(form),
        });
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

  const remove = async (row: AppointmentRow) => {
    if (!confirm(`${row.title || row.customerName || "Bu randevu"} silinsin mi?`)) return;
    try {
      await api(`/api/appointments/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Randevular</h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kayıt · keşif ve kurulum randevuları
          </p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Randevu
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-ink/70">Randevu yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Tarih / Saat</th>
                  <th className="px-5 py-3.5">Başlık</th>
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Atanan</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-ink/2">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-ink">
                      {fmtDate(r.date)}
                      <span className="ml-1.5 text-ink/50">{r.time}</span>
                    </td>
                    <td className="max-w-[240px] px-5 py-4">
                      <p className="truncate text-ink/85">{r.title || "Randevu"}</p>
                      <p className="mt-0.5 text-xs text-ink/45">
                        {APPOINTMENT_TYPE_LABEL[r.type] ?? r.type}
                      </p>
                      {r.address && (
                        <p className="truncate text-xs text-ink/45">{r.address}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink/85">{r.customerName ?? "-"}</p>
                      {r.customerPhone && (
                        <p className="text-xs text-ink/45">{r.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{r.assignedName ?? "Atanmadı"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} labels={APPOINTMENT_STATUS_LABEL} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {canDelete && (
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
          title={editing ? "Randevuyu Düzenle" : "Yeni Randevu"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tarih">
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Saat">
                <Input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Başlık">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Örn: Keşif randevusu — X AVM"
                  />
                </Field>
              </div>
              <Field label="Tür">
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {Object.keys(APPOINTMENT_TYPE_LABEL).map((t) => (
                    <option key={t} value={t}>
                      {APPOINTMENT_TYPE_LABEL[t]}
                    </option>
                  ))}
                </Select>
                {form.type === "servis-ariza" && (
                  <p className="mt-1.5 text-xs text-ink/45">
                    Bu randevu &quot;Tamamlandı&quot; olarak işaretlenince Servis sayfasında
                    otomatik bir servis kaydı açılır.
                  </p>
                )}
              </Field>
              <Field label="Müşteri">
                <CustomSelect
                  value={form.customerId ? String(form.customerId) : ""}
                  onChange={(v) => setForm({ ...form, customerId: v ? Number(v) : null })}
                  options={customers.map((c) => ({ value: String(c.id), label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}` }))}
                  placeholder="Müşteri seçin"
                />
              </Field>
              <Field label="Atanan personel">
                <Select
                  value={form.assignedTo ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">Atanmadı</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Adres">
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Yenibosna Merkez Mah. …"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Randevu notları…"
                  />
                </Field>
              </div>
              <Field label="Durum">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {Object.keys(APPOINTMENT_STATUS_LABEL).map((s) => (
                    <option key={s} value={s}>
                      {APPOINTMENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
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
    </div>
  );
}