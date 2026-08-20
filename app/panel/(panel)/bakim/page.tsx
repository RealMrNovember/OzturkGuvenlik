"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { CustomSelect } from "@/components/panel/form";
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
  Textarea,
  addMonths,
  fmtDate,
  todayStr,
} from "@/components/panel/ui";

type ContractRow = {
  id: number;
  customerId: number | null;
  type: string;
  startDate: string;
  lastServiceDate: string | null;
  nextServiceDate: string;
  intervalMonths: number;
  note: string;
  active: boolean;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
};

type CustomerRow = { id: number; name: string; phone: string; address: string };

const blank = {
  customerId: null as number | null,
  type: "",
  startDate: "",
  lastServiceDate: "",
  nextServiceDate: "",
  intervalMonths: "12",
  note: "",
  active: true,
};

function urgency(row: ContractRow): { label: string; tone: "red" | "amber" | "green" | "gray" } {
  if (!row.active) return { label: "Pasif", tone: "gray" };
  const diffDays = Math.floor(
    (new Date(`${row.nextServiceDate}T00:00:00`).getTime() - new Date(`${todayStr()}T00:00:00`).getTime()) /
      86_400_000
  );
  if (diffDays < 0) return { label: "Gecikmiş", tone: "red" };
  if (diffDays <= 30) return { label: "Yaklaşıyor", tone: "amber" };
  return { label: "Planlı", tone: "green" };
}

export default function BakimPage() {
  const canDelete = usePanelCan("delete_records");

  const [rows, setRows] = useState<ContractRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ContractRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const [contracts, custs] = await Promise.all([
        api<ContractRow[]>("/api/maintenance-contracts"),
        api<CustomerRow[]>("/api/customers"),
      ]);
      setRows(contracts);
      setCustomers(custs);
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
    setForm({ ...blank, startDate: todayStr(), nextServiceDate: addMonths(todayStr(), 12) });
    setCreating(true);
  };

  const openEdit = (row: ContractRow) => {
    setForm({
      customerId: row.customerId,
      type: row.type,
      startDate: row.startDate,
      lastServiceDate: row.lastServiceDate ?? "",
      nextServiceDate: row.nextServiceDate,
      intervalMonths: String(row.intervalMonths),
      note: row.note,
      active: row.active,
    });
    setEditing(row);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.customerId) {
      setError("Müşteri seçin.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      customerId: form.customerId,
      type: form.type,
      startDate: form.startDate,
      lastServiceDate: form.lastServiceDate || null,
      nextServiceDate: form.nextServiceDate,
      intervalMonths: Number(form.intervalMonths) || 12,
      note: form.note,
      active: form.active,
    };
    try {
      if (editing) {
        await api(`/api/maintenance-contracts/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/maintenance-contracts", { method: "POST", body: JSON.stringify(payload) });
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

  const completeService = async (row: ContractRow) => {
    const today = todayStr();
    try {
      await api(`/api/maintenance-contracts/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          lastServiceDate: today,
          nextServiceDate: addMonths(today, row.intervalMonths),
        }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (row: ContractRow) => {
    if (!confirm(`${row.customerName ?? "Bu"} bakım sözleşmesi silinsin mi?`)) return;
    try {
      await api(`/api/maintenance-contracts/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Bakım Sözleşmeleri</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} kayıt</p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Sözleşme
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Bakım sözleşmesi yok"
          desc="Periyodik bakım anlaşması yapılan müşterileri buradan takip edin."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Sözleşme</th>
                  <th className="px-5 py-3.5">Son Bakım</th>
                  <th className="px-5 py-3.5">Sonraki Bakım</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((row) => {
                  const u = urgency(row);
                  return (
                    <tr key={row.id} className="align-top hover:bg-ink/2">
                      <td className="px-5 py-4">
                        <p className="font-bold text-ink">{row.customerName ?? "-"}</p>
                        {row.customerPhone && <p className="text-xs text-ink/45">{row.customerPhone}</p>}
                      </td>
                      <td className="px-5 py-4 text-ink/80">{row.type || "-"}</td>
                      <td className="px-5 py-4 text-ink/70">
                        {row.lastServiceDate ? fmtDate(row.lastServiceDate) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink">{fmtDate(row.nextServiceDate)}</p>
                        <Badge tone={u.tone}>{u.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => completeService(row)}
                            aria-label="Bakımı tamamla"
                            title="Bakımı tamamla — bugünü son bakım yapar, sonraki tarihi otomatik hesaplar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600/80 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Icon name="check" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            aria-label="Düzenle"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                          >
                            <Icon name="pen" className="h-4 w-4" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => remove(row)}
                              aria-label="Sil"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          title={editing ? "Sözleşmeyi Düzenle" : "Yeni Bakım Sözleşmesi"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Müşteri">
                  <CustomSelect
                    value={form.customerId ? String(form.customerId) : ""}
                    onChange={(v) => setForm({ ...form, customerId: v ? Number(v) : null })}
                    options={customers.map((c) => ({
                      value: String(c.id),
                      label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}`,
                    }))}
                    placeholder="Müşteri seçin"
                  />
                </Field>
              </div>
              <Field label="Sözleşme tipi">
                <Input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="Örn: Yıllık bakım"
                />
              </Field>
              <Field label="Bakım aralığı (ay)">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={form.intervalMonths}
                  onChange={(e) => setForm({ ...form, intervalMonths: e.target.value })}
                />
              </Field>
              <Field label="Başlangıç tarihi">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </Field>
              <Field label="Son bakım tarihi">
                <Input
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) => setForm({ ...form, lastServiceDate: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Sonraki bakım tarihi">
                  <Input
                    type="date"
                    value={form.nextServiceDate}
                    onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea
                    rows={2}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-brand"
                />
                Sözleşme aktif
              </label>
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
