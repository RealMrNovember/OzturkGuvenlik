"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole, usePanelSession } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import {
  JobItemsEditor,
  emptyJobItem,
  type JobProductOption,
} from "@/components/panel/JobItemsEditor";
import { CurrencyAmountInput } from "@/components/panel/CurrencyAmountInput";
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
  JOB_STATUS_LABEL,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  fmtMoneyWithTry,
  todayStr,
} from "@/components/panel/ui";

type JobRow = {
  id: number;
  customerId: number | null;
  requestId: number | null;
  offerId: number | null;
  title: string;
  address: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  equipment: string[];
  items: { productId: number; qty: number; name: string; unitIds?: number[] }[];
  costTotal?: string;
  saleTotal: string;
  currency: string;
  exchangeRate: string;
  notes: string;
  staffIds: number[];
  staffNames: string[];
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
};

type CustomerRow = { id: number; name: string; phone: string };
type StaffRow = { id: number; name: string };
type ProductRow = JobProductOption & { costPrice?: string; exchangeRate?: string };

const blank = {
  title: "",
  address: "",
  startDate: "",
  endDate: "",
  status: "planlandi",
  equipment: [] as string[],
  equipmentText: "",
  items: [emptyJobItem()],
  saleTotal: "",
  currency: "TRY",
  exchangeRate: 1,
  notes: "",
  staffIds: [] as number[],
  customerId: null as number | null,
  requestId: null as number | null,
  offerId: null as number | null,
};

export default function IslerPage() {
  const role = usePanelRole();
  const isAdmin = role === "admin";
  const sessionId = usePanelSession().id;

  const [rows, setRows] = useState<JobRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<JobRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [myJobsOnly, setMyJobsOnly] = useState(!isAdmin);
  const [todayOnly, setTodayOnly] = useState(false);
  const [viewing, setViewing] = useState<JobRow | null>(null);

  const load = useCallback(async () => {
    try {
      const [jobs, custs, staffList, productList] = await Promise.all([
        api<JobRow[]>("/api/jobs"),
        api<CustomerRow[]>("/api/customers"),
        api<StaffRow[]>("/api/staff"),
        api<ProductRow[]>("/api/products"),
      ]);
      setRows(jobs);
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

  const openEdit = (row: JobRow) => {
    setForm({
      title: row.title,
      address: row.address,
      startDate: row.startDate ?? "",
      endDate: row.endDate ?? "",
      status: row.status,
      equipment: row.equipment,
      equipmentText: row.equipment.join(", "),
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: String(i.qty),
        unitIds: i.unitIds,
      })),
      saleTotal: row.saleTotal,
      currency: row.currency ?? "TRY",
      exchangeRate: Number(row.exchangeRate ?? 1),
      notes: row.notes,
      staffIds: row.staffIds,
      customerId: row.customerId,
      requestId: row.requestId,
      offerId: row.offerId,
    });
    setEditing(row);
  };

  // Her zaman ₺ cinsinden: ürünün kendi para biriminde girilmiş maliyeti,
  // ürünün kayıt anında kilitlenmiş kuruyla ₺'ye çevrilir (bkz. lib/stock.ts costTotalForItems).
  const estimatedCost = form.items.reduce((sum, i) => {
    const product = products.find((p) => p.id === i.productId);
    return sum + (Number(i.qty) || 0) * Number(product?.costPrice ?? 0) * Number(product?.exchangeRate ?? 1);
  }, 0);

  const toggleStaff = (id: number) =>
    setForm((cur) => ({
      ...cur,
      staffIds: cur.staffIds.includes(id)
        ? cur.staffIds.filter((s) => s !== id)
        : [...cur.staffIds, id],
    }));

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
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      address: form.address,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
      equipment: form.equipmentText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      items: cleanItems,
      saleTotal: Number(form.saleTotal) || 0,
      currency: form.currency,
      exchangeRate: form.exchangeRate,
      notes: form.notes,
      staffIds: form.staffIds,
      customerId: form.customerId,
      requestId: form.requestId,
      offerId: form.offerId,
    };
    try {
      if (editing) {
        await api(`/api/jobs/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
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

  const remove = async (row: JobRow) => {
    if (!confirm(`${row.title || `#${row.id}`} silinsin mi?`)) return;
    try {
      await api(`/api/jobs/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const today = todayStr();
  const visibleRows = useMemo(
    () =>
      rows.filter((j) => {
        if (myJobsOnly && !j.staffIds.includes(sessionId)) return false;
        if (todayOnly) {
          const start = j.startDate ?? j.endDate;
          const end = j.endDate ?? j.startDate;
          if (!start || !end || today < start || today > end) return false;
        }
        return true;
      }),
    [rows, myJobsOnly, todayOnly, sessionId, today]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">İşler</h1>
          <p className="mt-1 text-sm text-ink/55">
            {visibleRows.length === rows.length
              ? `${rows.length} kayıt`
              : `${visibleRows.length} / ${rows.length} kayıt`}
            {" · kurulum ve saha işleri"}
          </p>
        </div>
        <Btn onClick={openCreate}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni İş
        </Btn>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMyJobsOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              myJobsOnly ? "bg-ink text-white" : "bg-white text-ink/60 hover:bg-ink/5"
            }`}
          >
            <Icon name="users" className="h-3.5 w-3.5" />
            Bana atananlar
          </button>
          <button
            type="button"
            onClick={() => setTodayOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              todayOnly ? "bg-ink text-white" : "bg-white text-ink/60 hover:bg-ink/5"
            }`}
          >
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Bugünkü işlerim
          </button>
        </div>
      )}

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="İş yok" desc="Yeni iş oluşturarak başlayın." />
      ) : visibleRows.length === 0 ? (
        <EmptyState title="Sonuç yok" desc="Seçili filtreye uyan iş bulunamadı." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">İş</th>
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Tarih</th>
                  <th className="px-5 py-3.5">Ekip</th>
                  <th className="px-5 py-3.5">Durum</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Kâr</th>}
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {visibleRows.map((j) => (
                  <tr key={j.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => setViewing(j)} className="text-left">
                        <p className="font-bold text-ink hover:text-brand">
                          {j.title || `İş #${j.id}`}
                        </p>
                        <p className="max-w-[240px] truncate text-xs text-ink/45">
                          {j.address || j.customerName || "-"}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-ink/85">{j.customerName ?? "-"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink/55">
                      {j.startDate ? fmtDate(j.startDate) : "-"}
                      {j.endDate ? ` → ${fmtDate(j.endDate)}` : ""}
                    </td>
                    <td className="px-5 py-4 text-ink/70">
                      {j.staffNames.length > 0 ? j.staffNames.join(", ") : "Atanmadı"}
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={j.status}
                        onChange={async (e) => {
                          try {
                            await api(`/api/jobs/${j.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: e.target.value }),
                            });
                            await load();
                          } catch (err) {
                            setError((err as Error).message);
                          }
                        }}
                        className="w-40 py-1.5 text-xs"
                        aria-label="Durum"
                      >
                        {Object.keys(JOB_STATUS_LABEL).map((s) => (
                          <option key={s} value={s}>
                            {JOB_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-5 py-4 text-right font-bold">
                        {j.costTotal !== undefined ? (
                          <span
                            className={
                              Number(j.saleTotal) * Number(j.exchangeRate) - Number(j.costTotal) >= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }
                          >
                            {fmtMoney(Number(j.saleTotal) * Number(j.exchangeRate) - Number(j.costTotal))}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewing(j)}
                          aria-label="Görüntüle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(j)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => remove(j)}
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
          title={editing ? "İşi Düzenle" : "Yeni İş"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Başlık">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Örn: Site güvenlik kamerası kurulumu"
                  />
                </Field>
              </div>
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
              <Field label="Adres">
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>
              <Field label="Başlangıç">
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </Field>
              <Field label="Bitiş">
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </Field>
              <Field label="Durum">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {Object.keys(JOB_STATUS_LABEL).map((s) => (
                    <option key={s} value={s}>
                      {JOB_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ekipman / malzeme (serbest not, virgülle)">
                <Input
                  value={form.equipmentText}
                  onChange={(e) => setForm({ ...form, equipmentText: e.target.value })}
                  placeholder="Örn: 8x kamera, NVR 16 kanal, Cat6 kablo"
                />
              </Field>
              <Field label="Satış tutarı">
                <CurrencyAmountInput
                  amount={form.saleTotal}
                  currency={form.currency}
                  exchangeRate={form.exchangeRate}
                  onChange={(patch) =>
                    setForm((f) => ({
                      ...f,
                      saleTotal: patch.amount ?? f.saleTotal,
                      currency: patch.currency ?? f.currency,
                      exchangeRate: patch.exchangeRate ?? f.exchangeRate,
                    }))
                  }
                />
              </Field>
              <div className="sm:col-span-2">
                <JobItemsEditor
                  items={form.items}
                  onChange={(items) => setForm({ ...form, items })}
                  products={products}
                />
              </div>
              {isAdmin && form.items.length > 0 && (
                <div className="sm:col-span-2 flex flex-wrap gap-4 rounded-xl bg-ink/3 px-4 py-3 text-sm">
                  <span className="text-ink/60">
                    Tahmini maliyet: <strong className="text-ink">{fmtMoney(estimatedCost)}</strong>
                  </span>
                  <span className="text-ink/60">
                    Tahmini kâr:{" "}
                    <strong
                      className={
                        (Number(form.saleTotal) || 0) * form.exchangeRate - estimatedCost >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }
                    >
                      {fmtMoney((Number(form.saleTotal) || 0) * form.exchangeRate - estimatedCost)}
                    </strong>
                  </span>
                </div>
              )}
              <div className="sm:col-span-2">
                <Field label="Görevli personel">
                  <div className="flex flex-wrap gap-2">
                    {staff.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStaff(s.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          form.staffIds.includes(s.id)
                            ? "bg-brand text-white"
                            : "border border-ink/15 text-ink/70 hover:border-brand/50"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Notlar">
                  <Textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
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

      {viewing && (
        <Modal
          open
          onClose={() => setViewing(null)}
          title={viewing.title || `İş #${viewing.id}`}
          wide
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewing.status} labels={JOB_STATUS_LABEL} />
              <Badge tone="gray">{viewing.customerName ?? "Müşteri belirtilmedi"}</Badge>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-ink/45">Adres</dt>
                <dd className="mt-0.5 text-ink/80">{viewing.address || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Tarih aralığı</dt>
                <dd className="mt-0.5 text-ink/80">
                  {viewing.startDate ? fmtDate(viewing.startDate) : "-"}
                  {viewing.endDate ? ` → ${fmtDate(viewing.endDate)}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Görevli ekip</dt>
                <dd className="mt-0.5 text-ink/80">
                  {viewing.staffNames.length > 0 ? viewing.staffNames.join(", ") : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Kayıt</dt>
                <dd className="mt-0.5 text-ink/80">{fmtDateTime(viewing.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Satış tutarı</dt>
                <dd className="mt-0.5 font-bold text-ink">
                  {fmtMoneyWithTry(viewing.saleTotal, viewing.currency, viewing.exchangeRate)}
                </dd>
              </div>
              {isAdmin && viewing.costTotal !== undefined && (
                <div>
                  <dt className="text-xs font-semibold text-ink/45">Maliyet / Kâr</dt>
                  <dd className="mt-0.5 text-ink/80">
                    {fmtMoney(viewing.costTotal)} /{" "}
                    <strong
                      className={
                        Number(viewing.saleTotal) * Number(viewing.exchangeRate) - Number(viewing.costTotal) >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }
                    >
                      {fmtMoney(
                        Number(viewing.saleTotal) * Number(viewing.exchangeRate) - Number(viewing.costTotal)
                      )}
                    </strong>
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Kullanılan ürünler</dt>
                <dd className="mt-0.5 text-ink/80">
                  {viewing.items.length > 0
                    ? viewing.items.map((i) => `${i.name} × ${i.qty}`).join(", ")
                    : "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Ekipman / malzeme notu</dt>
                <dd className="mt-0.5 text-ink/80">
                  {viewing.equipment.length > 0 ? viewing.equipment.join(", ") : "-"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Notlar</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-ink/80">
                  {viewing.notes || "-"}
                </dd>
              </div>
            </dl>
          </div>
        </Modal>
      )}
    </div>
  );
}