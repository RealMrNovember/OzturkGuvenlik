"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import { InvoiceScanner } from "@/components/panel/InvoiceScanner";
import { SCAN_HANDOFF_KEY, type ScanHandoff } from "@/lib/scan-handoff";
import type { ExtractedInvoice } from "@/lib/invoice-ocr";
import type { ProductOption } from "@/components/panel/ItemsEditor";
import {
  Badge,
  Btn,
  Card,
  EmptyState,
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

type PurchaseLogRow = {
  key: string;
  invoiceId: number;
  invoiceNumber: string;
  issueDate: string;
  status: "odenmedi" | "odendi";
  received: boolean;
  currency: string;
  exchangeRate: string;
  supplierId: number;
  supplierName: string | null;
  productId: number | null;
  productName: string;
  qty: number;
  unitPrice: number;
};

export default function ToptancilarPage() {
  const canDelete = usePanelCan("delete_records");
  const canViewCosts = usePanelCan("view_costs");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [pendingScan, setPendingScan] = useState<ScanHandoff | null>(null);
  const [pendingNewName, setPendingNewName] = useState("");
  const [pendingSaving, setPendingSaving] = useState(false);

  const [log, setLog] = useState<PurchaseLogRow[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logSupplier, setLogSupplier] = useState("hepsi");
  const [logProduct, setLogProduct] = useState("hepsi");
  const [logQ, setLogQ] = useState("");
  const [logMinPrice, setLogMinPrice] = useState("");
  const [logMaxPrice, setLogMaxPrice] = useState("");
  const [logFrom, setLogFrom] = useState("");
  const [logTo, setLogTo] = useState("");

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
      if (canViewCosts) {
        api<ProductOption[]>("/api/products")
          .then(setProducts)
          .catch(() => {});
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewCosts]);

  const loadLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const data = await api<PurchaseLogRow[]>("/api/suppliers/purchase-log");
      setLog(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const t = setTimeout(loadLog, 0);
    return () => clearTimeout(t);
  }, [loadLog]);

  const logProductOptions = useMemo(() => {
    const names = new Set(log.map((r) => r.productName).filter(Boolean));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
  }, [log]);

  const visibleLog = useMemo(() => {
    const query = logQ.trim().toLowerCase();
    const min = logMinPrice ? Number(logMinPrice) : null;
    const max = logMaxPrice ? Number(logMaxPrice) : null;
    return log.filter((r) => {
      if (logSupplier !== "hepsi" && String(r.supplierId) !== logSupplier) return false;
      if (logProduct !== "hepsi" && r.productName !== logProduct) return false;
      if (min !== null && r.unitPrice < min) return false;
      if (max !== null && r.unitPrice > max) return false;
      if (logFrom && r.issueDate < logFrom) return false;
      if (logTo && r.issueDate > logTo) return false;
      if (query) {
        const hay = `${r.productName} ${r.invoiceNumber} ${r.supplierName ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [log, logSupplier, logProduct, logQ, logMinPrice, logMaxPrice, logFrom, logTo]);

  const logTotal = visibleLog.reduce((s, r) => s + r.qty * r.unitPrice * Number(r.exchangeRate), 0);

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

  const goToSupplierWithScan = (supplierId: number, handoff: ScanHandoff) => {
    sessionStorage.setItem(SCAN_HANDOFF_KEY, JSON.stringify(handoff));
    router.push(`/panel/toptancilar/${supplierId}`);
  };

  const handleExtracted = (
    result: ExtractedInvoice,
    scannedFileUrl: string,
    previewUrl: string,
    rawText: string
  ) => {
    setScannerOpen(false);
    const handoff = { result, scannedFileUrl, previewUrl, rawText };
    if (result.supplierId) {
      goToSupplierWithScan(result.supplierId, handoff);
      return;
    }
    // Tedarikçi güvenle tanınamadı — kullanıcı mevcut listeden seçsin ya da
    // yeni toptancı oluştursun, sonra tarama sonucu o sayfaya taşınır.
    setPendingScan(handoff);
    setPendingNewName(result.supplierNameGuess);
  };

  const proceedWithExistingSupplier = (supplierId: string) => {
    if (!pendingScan || !supplierId) return;
    goToSupplierWithScan(Number(supplierId), pendingScan);
    setPendingScan(null);
  };

  const proceedWithNewSupplier = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingScan || !pendingNewName.trim()) return;
    setPendingSaving(true);
    setError("");
    try {
      // Faturanın kendi üstündeki bilgilerle (vergi dairesi/no, telefon,
      // adres) oluştur — kullanıcı ismi düzeltebilir, geri kalanı belgeden
      // otomatik gelir (aşağıda önizlemesi gösteriliyor).
      const created = await api<SupplierRow>("/api/suppliers", {
        method: "POST",
        body: JSON.stringify({
          name: pendingNewName.trim(),
          taxOffice: pendingScan.result.supplierTaxOffice,
          taxNumber: pendingScan.result.supplierTaxNumber,
          phone: pendingScan.result.supplierPhone,
          address: pendingScan.result.supplierAddress,
        }),
      });
      goToSupplierWithScan(created.id, { ...pendingScan, autoCreatedSupplierId: created.id });
      setPendingScan(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPendingSaving(false);
    }
  };

  const visibleRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!query) return true;
      const haystack = `${r.name} ${r.phone} ${r.taxNumber} ${r.taxOffice}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, q]);
  const totalDebt = rows.reduce((s, r) => s + Number(r.balance), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Toptancılar</h1>
          <p className="mt-1 text-sm text-ink/55">
            {visibleRows.length === rows.length
              ? `${rows.length} kayıt`
              : `${visibleRows.length} / ${rows.length} kayıt`}{" "}
            · Toplam borç: <span className="font-bold text-ink">{fmtMoney(totalDebt)}</span>
          </p>
        </div>
        <div className="flex gap-2.5">
          {rows.length > 0 && (
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ad, telefon veya vergi no ara…"
                className="w-64 pl-10"
              />
            </div>
          )}
          {canViewCosts && (
            <Btn variant="ghost" onClick={() => setScannerOpen(true)}>
              <Icon name="camera" className="h-4 w-4" />
              Fatura Tara
            </Btn>
          )}
          <Btn onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            Yeni Toptancı
          </Btn>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Toptancı yok" desc="Yeni toptancı ekleyerek başlayın." />
      ) : visibleRows.length === 0 ? (
        <EmptyState title="Sonuç bulunamadı" desc="Aramayı değiştirmeyi deneyin." />
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
                {visibleRows.map((s) => (
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

      <Card
        title="Alım Kayıtları"
        action={
          visibleLog.length > 0 ? (
            <span className="text-xs font-semibold text-ink/55">
              {visibleLog.length} kalem · {fmtMoney(logTotal)}
            </span>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-end gap-3 border-b border-ink/8 px-5 py-4">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            />
            <Input
              value={logQ}
              onChange={(e) => setLogQ(e.target.value)}
              placeholder="Ürün, fatura no, toptancı ara…"
              className="w-56 pl-10"
            />
          </div>
          <Field label="Toptancı">
            <CustomSelect
              value={logSupplier === "hepsi" ? "" : logSupplier}
              onChange={(v) => setLogSupplier(v || "hepsi")}
              options={rows.map((r) => ({ value: String(r.id), label: r.name }))}
              placeholder="Tümü"
              className="w-44"
            />
          </Field>
          <Field label="Ürün">
            <CustomSelect
              value={logProduct === "hepsi" ? "" : logProduct}
              onChange={(v) => setLogProduct(v || "hepsi")}
              options={logProductOptions.map((p) => ({ value: p, label: p }))}
              placeholder="Tümü"
              className="w-44"
            />
          </Field>
          <Field label="Min. fiyat">
            <Input
              type="number"
              min="0"
              value={logMinPrice}
              onChange={(e) => setLogMinPrice(e.target.value)}
              className="w-24"
            />
          </Field>
          <Field label="Maks. fiyat">
            <Input
              type="number"
              min="0"
              value={logMaxPrice}
              onChange={(e) => setLogMaxPrice(e.target.value)}
              className="w-24"
            />
          </Field>
          <Field label="Başlangıç">
            <Input type="date" value={logFrom} onChange={(e) => setLogFrom(e.target.value)} className="w-40" />
          </Field>
          <Field label="Bitiş">
            <Input type="date" value={logTo} onChange={(e) => setLogTo(e.target.value)} className="w-40" />
          </Field>
          {(logSupplier !== "hepsi" ||
            logProduct !== "hepsi" ||
            logQ ||
            logMinPrice ||
            logMaxPrice ||
            logFrom ||
            logTo) && (
            <button
              type="button"
              onClick={() => {
                setLogSupplier("hepsi");
                setLogProduct("hepsi");
                setLogQ("");
                setLogMinPrice("");
                setLogMaxPrice("");
                setLogFrom("");
                setLogTo("");
              }}
              className="text-xs font-semibold text-ink/45 hover:text-ink"
            >
              Filtreleri temizle
            </button>
          )}
        </div>

        {logLoading ? (
          <Loading />
        ) : log.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-ink/50">
            Henüz alım kalemi yok — toptancı faturalarına kalem ekleyince burada görünür.
          </div>
        ) : visibleLog.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-ink/50">Filtreye uyan kayıt bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3">Ürün</th>
                  <th className="px-5 py-3">Toptancı</th>
                  <th className="px-5 py-3">Tarih</th>
                  <th className="px-5 py-3">Adet</th>
                  <th className="px-5 py-3">Birim Fiyat</th>
                  <th className="px-5 py-3">Fatura</th>
                  <th className="px-5 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {visibleLog.map((r) => (
                  <tr key={r.key} className="hover:bg-ink/2">
                    <td className="px-5 py-3 font-semibold text-ink">{r.productName}</td>
                    <td className="px-5 py-3">
                      <Link href={`/panel/toptancilar/${r.supplierId}`} className="text-brand hover:underline">
                        {r.supplierName ?? "-"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-ink/60">{fmtDate(r.issueDate)}</td>
                    <td className="px-5 py-3 text-ink/70">{r.qty}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink">
                      {fmtMoneyWithTry(r.unitPrice, r.currency, r.exchangeRate)}
                    </td>
                    <td className="px-5 py-3 text-ink/55">{r.invoiceNumber || `#${r.invoiceId}`}</td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={r.status === "odendi" ? "green" : "amber"}>
                          {r.status === "odendi" ? "Ödendi" : "Ödenmedi"}
                        </Badge>
                        {r.received && <Badge tone="brand">Teslim alındı</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canViewCosts && (
        <InvoiceScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          suppliers={rows}
          products={products}
          onExtracted={handleExtracted}
        />
      )}

      {pendingScan && (
        <Modal open onClose={() => setPendingScan(null)} title="Toptancıyı Seçin">
          <div className="space-y-4">
            <p className="text-sm text-ink/60">
              Belgeden tedarikçi otomatik tanınamadı — mevcut bir toptancı seçin ya da yeni oluşturun.
            </p>
            {rows.length > 0 && (
              <Field label="Mevcut toptancılardan seç">
                <CustomSelect
                  value=""
                  onChange={proceedWithExistingSupplier}
                  options={rows.map((r) => ({ value: String(r.id), label: r.name }))}
                  placeholder="Toptancı seçin"
                />
              </Field>
            )}
            <form onSubmit={proceedWithNewSupplier} className="space-y-3 border-t border-ink/8 pt-4">
              <Field label="Ya da yeni toptancı oluştur">
                <Input
                  required
                  value={pendingNewName}
                  onChange={(e) => setPendingNewName(e.target.value)}
                  placeholder="Firma adı"
                />
              </Field>
              {(pendingScan.result.supplierTaxOffice ||
                pendingScan.result.supplierTaxNumber ||
                pendingScan.result.supplierPhone ||
                pendingScan.result.supplierAddress) && (
                <div className="rounded-xl bg-surface p-3 text-xs text-ink/60">
                  <p className="mb-1 font-semibold text-ink/70">
                    Belgeden ayrıca şu bilgiler de otomatik alınacak:
                  </p>
                  {pendingScan.result.supplierTaxNumber && (
                    <p>
                      Vergi No: {pendingScan.result.supplierTaxNumber}
                      {pendingScan.result.supplierTaxOffice ? ` (${pendingScan.result.supplierTaxOffice})` : ""}
                    </p>
                  )}
                  {pendingScan.result.supplierPhone && <p>Telefon: {pendingScan.result.supplierPhone}</p>}
                  {pendingScan.result.supplierAddress && <p>Adres: {pendingScan.result.supplierAddress}</p>}
                </div>
              )}
              <details className="rounded-xl border border-ink/8 p-3 text-xs text-ink/55">
                <summary className="cursor-pointer font-semibold text-ink/70">
                  Tahmin yanlışsa: OCR'ın belgeden okuduğu ham metin
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-ink/60">
                  {pendingScan.rawText || "(boş)"}
                </pre>
              </details>
              <div className="flex justify-end gap-3">
                <Btn variant="ghost" onClick={() => setPendingScan(null)}>
                  Vazgeç
                </Btn>
                <Btn type="submit" disabled={pendingSaving || !pendingNewName.trim()}>
                  {pendingSaving ? "Oluşturuluyor…" : "Oluştur ve Devam Et"}
                </Btn>
              </div>
            </form>
          </div>
        </Modal>
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
