"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { site } from "@/lib/site";

const CURRENCY_SYMBOL: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

type OfferView = {
  title: string;
  customerName: string | null;
  items: { name: string; qty: number; unitPrice: number }[];
  taxRate: number;
  total: number;
  currency: string;
  status: string;
  note: string | null;
  createdAt: string;
  respondedAt: string | null;
};

function fmtMoney(n: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${symbol}`;
}

const STATUS_INFO: Record<string, { label: string; tone: string }> = {
  tasarim: { label: "Yanıt bekleniyor", tone: "bg-amber-100 text-amber-700" },
  gonderildi: { label: "Yanıt bekleniyor", tone: "bg-amber-100 text-amber-700" },
  onaylandi: { label: "Onaylandı", tone: "bg-emerald-100 text-emerald-700" },
  reddedildi: { label: "Reddedildi", tone: "bg-red-100 text-red-700" },
};

export default function PublicOfferPage() {
  const params = useParams<{ token: string }>();
  const [offer, setOffer] = useState<OfferView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/public/offers/${params.token}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Teklif yüklenemedi");
      setOffer(json.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  const respond = async (action: "approve" | "reject") => {
    if (
      !confirm(
        action === "approve"
          ? "Bu teklifi onaylıyor musunuz? Onay sonrası ekibimiz sizinle iletişime geçecek."
          : "Bu teklifi reddetmek istediğinize emin misiniz?"
      )
    )
      return;
    setResponding(true);
    setError("");
    try {
      const res = await fetch(`/api/public/offers/${params.token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "İşlem başarısız");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResponding(false);
    }
  };

  const subtotal = offer ? offer.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) : 0;
  const taxAmount = offer ? subtotal * (offer.taxRate / 100) : 0;
  const isPending = offer?.status === "tasarim" || offer?.status === "gonderildi";
  const info = offer ? (STATUS_INFO[offer.status] ?? { label: offer.status, tone: "bg-ink/10 text-ink/60" }) : null;

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/images/logo-square.png" alt={site.shortName} width={44} height={44} />
          <span className="text-lg font-bold tracking-tight text-ink">{site.shortName}</span>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-ink/8 bg-white p-10 text-center text-sm text-ink/50 shadow-sm">
            Yükleniyor…
          </div>
        ) : !offer ? (
          <div className="rounded-2xl border border-ink/8 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-ink">{error || "Teklif bulunamadı"}</p>
            <p className="mt-1 text-sm text-ink/50">Bağlantı geçersiz ya da süresi dolmuş olabilir.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink/40">Teklif</p>
                <h1 className="mt-0.5 text-xl font-bold text-ink">{offer.title || "Fiyat Teklifi"}</h1>
                {offer.customerName && <p className="mt-1 text-sm text-ink/55">{offer.customerName}</p>}
              </div>
              {info && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${info.tone}`}>{info.label}</span>
              )}
            </div>

            <div className="px-6 py-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/40">
                    <th className="pb-2">Ürün / Hizmet</th>
                    <th className="pb-2 text-center">Adet</th>
                    <th className="pb-2 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/6">
                  {offer.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-ink/80">{item.name}</td>
                      <td className="py-2.5 text-center text-ink/60">{item.qty}</td>
                      <td className="py-2.5 text-right font-semibold text-ink">
                        {fmtMoney(item.qty * item.unitPrice, offer.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 space-y-1.5 border-t border-ink/8 pt-4 text-sm">
                <div className="flex items-center justify-between text-ink/55">
                  <span>Ara Toplam</span>
                  <span>{fmtMoney(subtotal, offer.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-ink/55">
                  <span>KDV (%{offer.taxRate})</span>
                  <span>{fmtMoney(taxAmount, offer.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-ink">
                  <span>Genel Toplam</span>
                  <span>{fmtMoney(subtotal + taxAmount, offer.currency)}</span>
                </div>
              </div>

              {offer.note && (
                <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm text-ink/70">{offer.note}</p>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              {isPending ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => respond("approve")}
                    className="flex-1 rounded-full bg-brand px-6 py-3 text-center font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Teklifi Onayla
                  </button>
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => respond("reject")}
                    className="flex-1 rounded-full border border-ink/15 px-6 py-3 text-center font-bold text-ink/60 transition-colors hover:bg-ink/5 disabled:opacity-50"
                  >
                    Reddet
                  </button>
                </div>
              ) : (
                <p className="mt-6 text-center text-sm text-ink/50">
                  {offer.status === "onaylandi"
                    ? "Bu teklifi onayladınız — ekibimiz en kısa sürede sizinle iletişime geçecek."
                    : "Bu teklifi reddettiniz."}
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-ink/40">
          Sorularınız için: {site.phoneDisplay} · {site.email}
        </p>
      </div>
    </section>
  );
}
