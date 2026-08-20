"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
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
  fmtMoney,
} from "@/components/panel/ui";

type SupplierRow = {
  id: number;
  name: string;
  phone: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  paymentTermDays: number | null;
  note: string;
  balance: string;
  createdAt: string;
};

const blank = {
  name: "",
  phone: "",
  address: "",
  taxOffice: "",
  taxNumber: "",
  paymentTermDays: "",
  note: "",
};

export default function ToptancilarPage() {
  const canDelete = usePanelCan("delete_records");
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
  };

  const openEdit = (row: SupplierRow) => {
    setForm({
      name: row.name,
      phone: row.phone,
      address: row.address,
      taxOffice: row.taxOffice,
      taxNumber: row.taxNumber,
      paymentTermDays: row.paymentTermDays != null ? String(row.paymentTermDays) : "",
      note: row.note,
    });
    setEditing(row);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<SupplierRow[]>("/api/suppliers");
      setRows(data);
      const editId = searchParams.get("edit");
      if (editId) {
        const target = data.find((s) => s.id === Number(editId));
        if (target) openEdit(target);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        paymentTermDays: form.paymentTermDays ? Number(form.paymentTermDays) : null,
      };
      if (editing) {
        await api(`/api/suppliers/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/api/suppliers", { method: "POST", body: JSON.stringify(payload) });
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

  const remove = async (row: SupplierRow) => {
    if (!confirm(`${row.name} silinsin mi? Bağlı faturaları da silinecek.`)) return;
    try {
      await api(`/api/suppliers/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const totalDebt = rows.reduce((s, r) => s + Number(r.balance), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Toptancılar</h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kayıt · Toplam borç: <span className="font-bold text-ink">{fmtMoney(totalDebt)}</span>
          </p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Toptancı
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Toptancı yok" desc="Yeni toptancı ekleyerek başlayın." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Toptancı</th>
                  <th className="px-5 py-3.5">İletişim</th>
                  <th className="px-5 py-3.5">Vergi No</th>
                  <th className="px-5 py-3.5">Borcumuz</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((s) => (
                  <tr key={s.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <Link href={`/panel/toptancilar/${s.id}`} className="font-bold text-ink hover:text-brand">
                        {s.name}
                      </Link>
                      {s.address && (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-ink/45">{s.address}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {s.phone ? (
                        <a
                          href={`tel:+${s.phone.replace(/\D/g, "")}`}
                          className="font-semibold text-brand hover:underline"
                        >
                          {s.phone}
                        </a>
                      ) : (
                        <span className="text-ink/45">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink/70">
                      {s.taxNumber || "-"}
                      {s.taxOffice && <p className="text-xs text-ink/45">{s.taxOffice}</p>}
                    </td>
                    <td className="px-5 py-4">
                      {Number(s.balance) > 0 ? (
                        <Badge tone="amber">{fmtMoney(s.balance)}</Badge>
                      ) : (
                        <span className="text-ink/45">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => remove(s)}
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
          title={editing ? "Toptancıyı Düzenle" : "Yeni Toptancı"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Firma / Ad">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Telefon">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0212 XXX XX XX"
                />
              </Field>
              <Field label="Vergi Dairesi">
                <Input
                  value={form.taxOffice}
                  onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                />
              </Field>
              <Field label="Vergi No">
                <Input
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                />
              </Field>
              <Field label="Ödeme vadesi (gün)">
                <Input
                  type="number"
                  min="0"
                  value={form.paymentTermDays}
                  onChange={(e) => setForm({ ...form, paymentTermDays: e.target.value })}
                  placeholder="örn. 30"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Adres">
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
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
    </div>
  );
}
