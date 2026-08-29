"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/fetch";
import { Icon } from "@/components/icons";
import { Badge, ErrorBox, Input, Loading, fmtDateTime } from "@/components/panel/ui";

type GibInvoiceRow = {
  id: number;
  direction: "gelen" | "giden";
  ettn: string | null;
  invoiceNumber: string;
  issueDate: string;
  counterpartyName: string | null;
  counterpartyTaxId: string | null;
  amount: string;
  taxAmount: string | null;
  currency: string;
  gibStatus: string | null;
  xmlUrl: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

type BookmarkletLinks = { gelen: string; giden: string };

const TABS = [
  { key: "all", label: "Tümü" },
  { key: "gelen", label: "Gelen Faturalar" },
  { key: "giden", label: "Giden Faturalar" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function fmtMoneySimple(amount: string, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function fmtInvoiceDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function GibFaturalarPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<GibInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [links, setLinks] = useState<BookmarkletLinks | null>(null);
  const [linksError, setLinksError] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (tab !== "all") qs.set("direction", tab);
      if (q.trim()) qs.set("q", q.trim());
      const data = await api<GibInvoiceRow[]>(`/api/gib-invoices?${qs.toString()}`);
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tab, q]);

  useEffect(() => {
    const t = setTimeout(load, 200); // arama kutusu için hafif debounce
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api<BookmarkletLinks>("/api/gib-invoices/bookmarklet")
      .then(setLinks)
      .catch((e) => setLinksError((e as Error).message));
  }, []);

  const totals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    for (const r of rows) {
      byCurrency.set(r.currency, (byCurrency.get(r.currency) ?? 0) + Number(r.amount));
    }
    return Array.from(byCurrency.entries());
  }, [rows]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">GİB Faturalar</h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kayıt · GİB e-Fatura/e-Arşiv portalından aktarılan kalıcı fatura arşivi
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSetup((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand/50"
        >
          <Icon name="download" className="h-4 w-4" />
          {showSetup ? "Kurulumu gizle" : "Aktarım aracını kur"}
        </button>
      </div>

      {showSetup && (
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-ink">GİB'den fatura aktarma aracı</p>
          <p className="mt-1 text-sm text-ink/60">
            Aşağıdaki iki bağlantıyı tarayıcınızın yer imleri çubuğuna sürükleyin. GİB e-Fatura/e-Arşiv
            portalında fatura listesi ekranındayken bu yer imine tıklayın — ekrandaki faturalar otomatik
            olarak buraya aktarılır. Şifreniz hiçbir zaman bu sisteme gönderilmez; yalnızca zaten görüntülediğiniz
            sayfadaki veriler okunur.
          </p>
          {linksError && <ErrorBox message={linksError} />}
          {links ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={links.gelen}
                onClick={(e) => e.preventDefault()}
                className="inline-flex cursor-grab items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white active:cursor-grabbing"
                title="Bu bağlantıyı yer imleri çubuğuna sürükleyin"
              >
                <Icon name="download" className="h-4 w-4" />
                GİB Gelen Faturalarını Al
              </a>
              <a
                href={links.giden}
                onClick={(e) => e.preventDefault()}
                className="inline-flex cursor-grab items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white active:cursor-grabbing"
                title="Bu bağlantıyı yer imleri çubuğuna sürükleyin"
              >
                <Icon name="download" className="h-4 w-4" />
                GİB Giden Faturalarını Al
              </a>
            </div>
          ) : (
            !linksError && <p className="mt-3 text-sm text-ink/50">Yükleniyor…</p>
          )}
          <p className="mt-4 text-xs text-ink/45">
            Aynı fatura birden fazla kez gönderilse bile sistem otomatik olarak yalnızca bir kez kaydeder —
            butona istediğiniz kadar tıklayabilirsiniz, mükerrer kayıt oluşmaz.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-brand text-white" : "bg-surface text-ink/60 hover:bg-ink/8"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Fatura no, unvan veya VKN ara…"
          className="w-64"
        />
      </div>

      {totals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {totals.map(([currency, sum]) => (
            <div key={currency} className="rounded-2xl border border-ink/8 bg-white px-5 py-3.5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Toplam ({currency})</p>
              <p className="mt-1 text-xl font-bold text-ink">{fmtMoneySimple(String(sum), currency)}</p>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-ink/70">Henüz fatura aktarılmadı</p>
          <p className="mt-1 text-sm text-ink/50">
            Yukarıdaki &quot;Aktarım aracını kur&quot; ile bookmarklet&apos;i tarayıcınıza ekleyip GİB
            portalından ilk aktarımı yapın.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Fatura</th>
                  <th className="px-5 py-3.5">Yön</th>
                  <th className="px-5 py-3.5">Karşı Taraf</th>
                  <th className="px-5 py-3.5">Tarih</th>
                  <th className="px-5 py-3.5">Tutar</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Belge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((r) => (
                  <tr key={r.id} className="align-top transition-colors hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <p className="font-bold text-ink">{r.invoiceNumber}</p>
                      <p className="text-xs text-ink/50">{fmtDateTime(r.createdAt)} aktarıldı</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={r.direction === "gelen" ? "amber" : "brand"}>
                        {r.direction === "gelen" ? "Gelen" : "Giden"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink/80">{r.counterpartyName || "-"}</p>
                      {r.counterpartyTaxId && <p className="text-xs text-ink/45">{r.counterpartyTaxId}</p>}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{fmtInvoiceDate(r.issueDate)}</td>
                    <td className="px-5 py-4 font-semibold text-ink">{fmtMoneySimple(r.amount, r.currency)}</td>
                    <td className="px-5 py-4">
                      {r.gibStatus ? <Badge tone="gray">{r.gibStatus}</Badge> : <span className="text-ink/30">-</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {r.xmlUrl && (
                          <a href={r.xmlUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline">
                            XML
                          </a>
                        )}
                        {r.pdfUrl && (
                          <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline">
                            PDF
                          </a>
                        )}
                        {!r.xmlUrl && !r.pdfUrl && <span className="text-xs text-ink/30">-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
