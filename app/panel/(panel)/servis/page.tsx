"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { JobItemsEditor, emptyJobItem, type JobProductOption } from "@/components/panel/JobItemsEditor";
import {
  Badge,
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
  SERVICE_TICKET_STATUS_LABEL,
  fmtDate,
  fmtDateTime,
  fmtMoney,
} from "@/components/panel/ui";

type TicketRow = {
  id: number;
  customerId: number | null;
  appointmentId: number | null;
  device: string;
  location: string;
  issue: string;
  result: string;
  status: string;
  assignedTo: number | null;
  items: { productId: number; qty: number; name: string; unitIds?: number[] }[];
  costTotal?: string;
  fee: string;
  category: string;
  requestType: string;
  billingType: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  customerName: string | null;
  customerPhone: string | null;
  assignedName: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  "video-izleme": "Video İzleme",
  "hirsiz-alarm": "Hırsız Alarm",
  "yangin-algilama": "Yangın Algılama",
  seslendirme: "Seslendirme",
  "gecis-kontrol": "Geçiş Kontrol",
  diger: "Diğer",
};

const REQUEST_TYPE_LABEL: Record<string, string> = {
  montaj: "Montaj",
  onarim: "Onarım",
  bakim: "Bakım",
  kesif: "Keşif",
  servis: "Servis",
  demontaj: "Demontaj",
};

const BILLING_TYPE_LABEL: Record<string, string> = {
  garanti: "Garanti Kapsamında",
  ucretli: "Ücretli",
  sozlesmeli: "Sözleşmeli",
};

type CustomerRow = { id: number; name: string; phone: string; address: string };
type StaffRow = { id: number; name: string };
type ProductRow = JobProductOption & { costPrice?: string };

const blank = {
  customerId: null as number | null,
  device: "",
  location: "",
  issue: "",
  result: "",
  status: "acik",
  assignedTo: null as number | null,
  items: [emptyJobItem()],
  fee: "",
  category: "diger",
  requestType: "servis",
  billingType: "ucretli",
  startTime: "",
  endTime: "",
};

export default function ServisPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";

  const [rows, setRows] = useState<TicketRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<TicketRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<TicketRow | null>(null);
  const [form, setForm] = useState(blank);

  const load = useCallback(async () => {
    try {
      const [tickets, custs, staffList, productList] = await Promise.all([
        api<TicketRow[]>("/api/service-tickets"),
        api<CustomerRow[]>("/api/customers"),
        api<StaffRow[]>("/api/staff"),
        api<ProductRow[]>("/api/products"),
      ]);
      setRows(tickets);
      setCustomers(custs);
      setStaff(staffList);
      setProducts(productList);
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

  const openEdit = (row: TicketRow) => {
    setForm({
      customerId: row.customerId,
      device: row.device,
      location: row.location,
      issue: row.issue,
      result: row.result,
      status: row.status,
      assignedTo: row.assignedTo,
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: String(i.qty),
        unitIds: i.unitIds,
      })),
      fee: row.fee,
      category: row.category || "diger",
      requestType: row.requestType || "servis",
      billingType: row.billingType || "ucretli",
      startTime: row.startTime || "",
      endTime: row.endTime || "",
    });
    setEditing(row);
  };

  const estimatedCost = form.items.reduce((sum, i) => {
    const product = products.find((p) => p.id === i.productId);
    return sum + (Number(i.qty) || 0) * Number(product?.costPrice ?? 0);
  }, 0);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const cleanItems = form.items
      .filter((i) => i.productId && Number(i.qty) > 0)
      .map((i) => ({
        productId: i.productId as number,
        qty: Number(i.qty),
        name: i.name,
        ...(i.unitIds ? { unitIds: i.unitIds } : {}),
      }));
    if (!form.issue.trim()) {
      setError("Arıza açıklaması gerekli.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      customerId: form.customerId,
      device: form.device,
      location: form.location,
      issue: form.issue,
      result: form.result,
      status: form.status,
      assignedTo: form.assignedTo,
      items: cleanItems,
      fee: Number(form.fee) || 0,
      category: form.category,
      requestType: form.requestType,
      billingType: form.billingType,
      startTime: form.startTime,
      endTime: form.endTime,
    };
    try {
      if (editing) {
        await api(`/api/service-tickets/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/api/service-tickets", { method: "POST", body: JSON.stringify(payload) });
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

  const remove = async (row: TicketRow) => {
    if (!confirm(`${row.device || `Servis #${row.id}`} silinsin mi?`)) return;
    try {
      await api(`/api/service-tickets/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const setStatus = async (row: TicketRow, status: string) => {
    try {
      await api(`/api/service-tickets/${row.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Servis / Arıza</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} kayıt</p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Servis Kaydı
        </Btn>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Servis kaydı yok" desc="Bir arıza bildirimi geldiğinde buradan kaydedin." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Cihaz / Arıza</th>
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Teknisyen</th>
                  <th className="px-5 py-3.5">Ücret</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((t) => (
                  <tr key={t.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setViewing(t)} className="text-left">
                        <p className="font-bold text-ink hover:text-brand">{t.device || `Servis #${t.id}`}</p>
                        <p className="max-w-[260px] truncate text-xs text-ink/45">{t.issue}</p>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink/85">{t.customerName ?? "-"}</p>
                      {t.customerPhone && <p className="text-xs text-ink/45">{t.customerPhone}</p>}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{t.assignedName ?? "Atanmadı"}</td>
                    <td className="px-5 py-4 font-bold text-ink">{fmtMoney(t.fee)}</td>
                    <td className="px-5 py-4">
                      <Select
                        value={t.status}
                        onChange={(e) => setStatus(t, e.target.value)}
                        className="w-40 py-1.5 text-xs"
                        aria-label="Durum"
                      >
                        {Object.keys(SERVICE_TICKET_STATUS_LABEL).map((s) => (
                          <option key={s} value={s}>
                            {SERVICE_TICKET_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/api/service-tickets/${t.id}/pdf`}
                          aria-label="Servis Formu PDF İndir"
                          title="Servis Formu PDF İndir"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="download" className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setViewing(t)}
                          aria-label="Görüntüle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => remove(t)}
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
          title={editing ? "Servis Kaydını Düzenle" : "Yeni Servis Kaydı"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Müşteri">
                <CustomSelect
                  value={form.customerId ? String(form.customerId) : ""}
                  onChange={(v) => {
                    const c = customers.find((x) => x.id === Number(v));
                    setForm({
                      ...form,
                      customerId: v ? Number(v) : null,
                      location: form.location || c?.address || "",
                    });
                  }}
                  options={customers.map((c) => ({
                    value: String(c.id),
                    label: `${c.name}${c.phone ? ` · ${c.phone}` : ""}`,
                  }))}
                  placeholder="Müşteri seçin"
                />
              </Field>
              <Field label="Cihaz">
                <Input
                  value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                  placeholder="Örn: NVR, Kamera 3 - giriş"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Lokasyon / adres">
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Arıza açıklaması">
                  <Textarea
                    rows={2}
                    value={form.issue}
                    onChange={(e) => setForm({ ...form, issue: e.target.value })}
                    placeholder="Müşterinin bildirdiği sorun"
                  />
                </Field>
              </div>
              <Field label="Teknisyen">
                <CustomSelect
                  value={form.assignedTo ? String(form.assignedTo) : ""}
                  onChange={(v) => setForm({ ...form, assignedTo: v ? Number(v) : null })}
                  options={staff.map((s) => ({ value: String(s.id), label: s.name }))}
                  placeholder="Atanmadı"
                />
              </Field>
              <Field label="Durum">
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {Object.keys(SERVICE_TICKET_STATUS_LABEL).map((s) => (
                    <option key={s} value={s}>
                      {SERVICE_TICKET_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Servis ücreti">
                <Input
                  type="number"
                  min="0"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder="₺"
                />
              </Field>
              <Field label="Sistem kategorisi (form için)">
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.keys(CATEGORY_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {CATEGORY_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Talep türü (form için)">
                <Select
                  value={form.requestType}
                  onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                >
                  {Object.keys(REQUEST_TYPE_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {REQUEST_TYPE_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Fatura tipi (form için)">
                <Select
                  value={form.billingType}
                  onChange={(e) => setForm({ ...form, billingType: e.target.value })}
                >
                  {Object.keys(BILLING_TYPE_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {BILLING_TYPE_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Başlangıç saati">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </Field>
              <Field label="Bitiş saati">
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </Field>
            </div>

            <JobItemsEditor
              items={form.items}
              onChange={(items) => setForm({ ...form, items })}
              products={products}
            />
            {isAdmin && form.items.length > 0 && (
              <div className="flex flex-wrap gap-4 rounded-xl bg-ink/3 px-4 py-3 text-sm">
                <span className="text-ink/60">
                  Tahmini parça maliyeti: <strong className="text-ink">{fmtMoney(estimatedCost)}</strong>
                </span>
              </div>
            )}

            <Field label="Sonuç / yapılan işlem">
              <Textarea
                rows={2}
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                placeholder="Servis tamamlandığında ne yapıldığını yazın"
              />
            </Field>

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
        <Modal open onClose={() => setViewing(null)} title={viewing.device || `Servis #${viewing.id}`} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewing.status} labels={SERVICE_TICKET_STATUS_LABEL} />
              <Badge tone="gray">{viewing.customerName ?? "Müşteri belirtilmedi"}</Badge>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-ink/45">Lokasyon</dt>
                <dd className="mt-0.5 text-ink/80">{viewing.location || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Teknisyen</dt>
                <dd className="mt-0.5 text-ink/80">{viewing.assignedName ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Servis ücreti</dt>
                <dd className="mt-0.5 font-bold text-ink">{fmtMoney(viewing.fee)}</dd>
              </div>
              {isAdmin && viewing.costTotal !== undefined && (
                <div>
                  <dt className="text-xs font-semibold text-ink/45">Parça maliyeti</dt>
                  <dd className="mt-0.5 text-ink/80">{fmtMoney(viewing.costTotal)}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Arıza açıklaması</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-ink/80">{viewing.issue}</dd>
              </div>
              {viewing.items.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-ink/45">Kullanılan parçalar</dt>
                  <dd className="mt-0.5 text-ink/80">
                    {viewing.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Sonuç</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-ink/80">{viewing.result || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Açılış</dt>
                <dd className="mt-0.5 text-ink/80">{fmtDateTime(viewing.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Son güncelleme</dt>
                <dd className="mt-0.5 text-ink/80">{fmtDate(viewing.updatedAt.slice(0, 10))}</dd>
              </div>
            </dl>
            <div className="flex justify-end border-t border-ink/8 pt-4">
              <a
                href={`/api/service-tickets/${viewing.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
              >
                <Icon name="download" className="h-4 w-4" />
                Servis Formu PDF İndir
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
