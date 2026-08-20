"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { BarcodeScannerModal } from "@/components/panel/BarcodeScanner";
import {
  Badge,
  Btn,
  Card,
  ErrorBox,
  Loading,
  Select,
  Textarea,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  fmtMoneyWithTry,
} from "@/components/panel/ui";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  unit: string;
  costPrice?: string;
  salePrice: string;
  stockQty: number;
  barcode: string | null;
  serialized: boolean;
  active: boolean;
  createdAt: string;
};

type UnitRow = {
  id: number;
  productId: number;
  serialNumber: string;
  status: string;
  jobId: number | null;
  serviceTicketId: number | null;
  note: string;
  createdAt: string;
  installedAt: string | null;
};

type PurchaseHistoryRow = {
  invoiceId: number;
  invoiceNumber: string;
  issueDate: string;
  currency: string;
  exchangeRate: string;
  supplierId: number;
  supplierName: string | null;
  qty: number;
  unitPrice: number;
};

const UNIT_STATUS_LABEL: Record<string, string> = {
  stokta: "Stokta",
  kuruldu: "Kuruldu",
  arizali: "Arızalı",
  iade: "İade",
};

export default function UrunDetayPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const canViewCosts = usePanelCan("view_costs");
  const canManageProducts = usePanelCan("manage_products");

  const [product, setProduct] = useState<Product | null>(null);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [adding, setAdding] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryRow[]>([]);

  const load = useCallback(async () => {
    if (!Number.isInteger(productId)) return;
    try {
      const [products, unitRows] = await Promise.all([
        api<Product[]>("/api/products"),
        api<UnitRow[]>(`/api/products/${productId}/units`),
      ]);
      setProduct(products.find((p) => p.id === productId) ?? null);
      setUnits(unitRows);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    if (!canViewCosts || !Number.isInteger(productId)) return;
    api<PurchaseHistoryRow[]>(`/api/products/${productId}/purchase-history`)
      .then(setPurchaseHistory)
      .catch(() => {});
  }, [canViewCosts, productId]);

  const addSerials = async (serialNumbers: string[]) => {
    if (serialNumbers.length === 0) return;
    setError("");
    try {
      const res = await api<{ added: UnitRow[]; skipped: string[] }>(
        `/api/products/${productId}/units`,
        { method: "POST", body: JSON.stringify({ serialNumbers }) }
      );
      setNotice(
        res.skipped.length > 0
          ? `${res.added.length} eklendi, ${res.skipped.length} zaten kayıtlıydı: ${res.skipped.join(", ")}`
          : `${res.added.length} seri numarası eklendi.`
      );
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const submitBulk = async (e: FormEvent) => {
    e.preventDefault();
    const list = bulkText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    setAdding(true);
    await addSerials(list);
    setBulkText("");
    setAdding(false);
  };

  const handleScan = async (code: string) => {
    setScanCount((c) => c + 1);
    await addSerials([code]);
  };

  const updateUnit = async (unit: UnitRow, patch: { status?: string; note?: string }) => {
    try {
      await api(`/api/products/${productId}/units/${unit.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeUnit = async (unit: UnitRow) => {
    if (!confirm(`${unit.serialNumber} silinsin mi?`)) return;
    try {
      await api(`/api/products/${productId}/units/${unit.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (!product) return <ErrorBox message={error || "Ürün bulunamadı"} />;

  const counts = units.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <Link href="/panel/urunler" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        Ürünler
      </Link>

      {error && <ErrorBox message={error} />}
      {notice && (
        <p className="rounded-xl bg-brand/5 px-4 py-3 text-sm text-ink/70">{notice}</p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink">{product.name}</h1>
            {product.serialized && <Badge tone="brand">Seri takipli</Badge>}
            {!product.active && <Badge tone="gray">Pasif</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/60">
            {(product.brand || product.model) && (
              <span className="font-semibold text-ink/75">
                {[product.brand, product.model].filter(Boolean).join(" · ")}
              </span>
            )}
            <span>{product.category || "Kategori yok"}</span>
            <span>{product.sku || "SKU yok"}</span>
            {product.barcode && <span>Barkod: {product.barcode}</span>}
          </div>
        </div>
        <Link href={`/panel/urunler?edit=${product.id}`}>
          <Btn variant="ghost">
            <Icon name="pen" className="h-4 w-4" />
            Düzenle
          </Btn>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {canViewCosts && (
          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink/55">Alış fiyatı</p>
            <p className="mt-1 text-2xl font-black text-ink">{fmtMoney(product.costPrice ?? 0)}</p>
          </div>
        )}
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Satış fiyatı</p>
          <p className="mt-1 text-2xl font-black text-ink">{fmtMoney(product.salePrice)}</p>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-ink/55">Stokta</p>
          <p className="mt-1 text-2xl font-black text-ink">{product.stockQty}</p>
        </div>
      </div>

      {canViewCosts && (
        <Card title="Alım geçmişi">
          {purchaseHistory.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink/50">
              Bu ürün henüz bir toptancı faturasında kalem olarak geçmedi.
            </div>
          ) : (
            <div className="divide-y divide-ink/6">
              {purchaseHistory.map((h) => (
                <Link
                  key={`${h.invoiceId}-${h.supplierId}`}
                  href={`/panel/toptancilar/${h.supplierId}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {h.supplierName ?? "Toptancı"}
                    </p>
                    <p className="text-xs text-ink/45">
                      {fmtDate(h.issueDate)}
                      {h.invoiceNumber ? ` · ${h.invoiceNumber}` : ""} · {h.qty} adet
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-ink">
                    {fmtMoneyWithTry(h.unitPrice, h.currency, h.exchangeRate)}/adet
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}

      {!product.serialized ? (
        <Card>
          <div className="px-5 py-8 text-center text-sm text-ink/50">
            Bu ürün seri takipli değil — stok adedi düz sayı olarak tutuluyor.
            <br />
            Seri numarasıyla takip etmek isterseniz ürünü düzenleyip &quot;Seri numaralı
            takip&quot;i açın.
          </div>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {Object.keys(UNIT_STATUS_LABEL).map((s) => (
              <Badge key={s} tone={s === "stokta" ? "green" : s === "kuruldu" ? "brand" : "gray"}>
                {UNIT_STATUS_LABEL[s]}: {counts[s] ?? 0}
              </Badge>
            ))}
          </div>

          {canManageProducts && (
            <Card title="Seri numarası ekle">
              <div className="space-y-4 px-5 py-4">
                <div>
                  <Btn type="button" onClick={() => setScannerOpen(true)}>
                    <Icon name="search" className="h-4 w-4" />
                    Barkodla art arda ekle{scanCount > 0 ? ` (${scanCount})` : ""}
                  </Btn>
                  <p className="mt-1.5 text-xs text-ink/45">
                    Her cihazın üzerindeki seri no/QR&apos;ı tek tek okutun — kapatana kadar
                    tarama devam eder.
                  </p>
                </div>
                <form onSubmit={submitBulk} className="space-y-2">
                  <Textarea
                    rows={3}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"Ya da her satıra bir seri numarası yapıştırın:\nSN-00123\nSN-00124"}
                  />
                  <Btn type="submit" variant="ghost" disabled={adding || !bulkText.trim()}>
                    {adding ? "Ekleniyor…" : "Listeyi Ekle"}
                  </Btn>
                </form>
              </div>
            </Card>
          )}

          <Card title={`Seri numaraları (${units.length})`}>
            {units.length === 0 ? (
              <div className="px-5 py-8 text-sm text-ink/50">Henüz seri numarası eklenmedi.</div>
            ) : (
              units.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-ink">{u.serialNumber}</p>
                    <p className="text-xs text-ink/45">
                      {fmtDateTime(u.createdAt)}
                      {u.installedAt ? ` · kuruldu: ${fmtDate(u.installedAt.slice(0, 10))}` : ""}
                      {u.jobId ? ` · İş #${u.jobId}` : ""}
                      {u.serviceTicketId ? ` · Servis #${u.serviceTicketId}` : ""}
                    </p>
                  </div>
                  {canManageProducts ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={u.status}
                        onChange={(e) => updateUnit(u, { status: e.target.value })}
                        className="w-32 py-1.5 text-xs"
                        aria-label="Durum"
                        disabled={u.status === "kuruldu"}
                      >
                        {Object.keys(UNIT_STATUS_LABEL).map((s) => (
                          <option key={s} value={s} disabled={s === "kuruldu"}>
                            {UNIT_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                      {u.status !== "kuruldu" && (
                        <button
                          type="button"
                          onClick={() => removeUnit(u)}
                          aria-label="Sil"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <Badge tone={u.status === "stokta" ? "green" : u.status === "kuruldu" ? "brand" : "gray"}>
                      {UNIT_STATUS_LABEL[u.status] ?? u.status}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </Card>
        </>
      )}

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        title="Seri Numarası Tara"
        continuous
      />
    </div>
  );
}
