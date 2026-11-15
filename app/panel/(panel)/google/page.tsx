"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { Btn, Card, ErrorBox, Field, Input, Loading } from "@/components/panel/ui";
import type { IconName } from "@/lib/services";

type TabKey = "ayarlar" | "rehber";

const TABS: { key: TabKey; label: string; icon: IconName; desc: string }[] = [
  { key: "ayarlar", label: "Ayarlar", icon: "target", desc: "Analytics, Arama Konsolu, Google Ads, SEO" },
  { key: "rehber", label: "Reklam Rehberi", icon: "help", desc: "Google Ads'i doğru şekilde kurma rehberi" },
];

type SiteSettings = {
  id: number;
  googleRating: string | null;
  googleReviewCount: number | null;
  googleReviewsUrl: string | null;
  googleAnalyticsId: string | null;
  googleSiteVerification: string | null;
  googleAdsConversionId: string | null;
  googleAdsConversionLabel: string | null;
  googleAdsReportEmbedUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
};

export default function GooglePage() {
  const isAdmin = usePanelCan("manage_settings");
  const [tab, setTab] = useState<TabKey>("ayarlar");

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [googleRating, setGoogleRating] = useState("");
  const [googleReviewCount, setGoogleReviewCount] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");
  const [googleAdsConversionId, setGoogleAdsConversionId] = useState("");
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState("");
  const [googleAdsReportEmbedUrl, setGoogleAdsReportEmbedUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  const [loading, setLoading] = useState(() => isAdmin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api<SiteSettings>("/api/site-settings");
      setSettings(data);
      setGoogleRating(data.googleRating ?? "");
      setGoogleReviewCount(data.googleReviewCount != null ? String(data.googleReviewCount) : "");
      setGoogleReviewsUrl(data.googleReviewsUrl ?? "");
      setGoogleAnalyticsId(data.googleAnalyticsId ?? "");
      setGoogleSiteVerification(data.googleSiteVerification ?? "");
      setGoogleAdsConversionId(data.googleAdsConversionId ?? "");
      setGoogleAdsConversionLabel(data.googleAdsConversionLabel ?? "");
      setGoogleAdsReportEmbedUrl(data.googleAdsReportEmbedUrl ?? "");
      setSeoTitle(data.seoTitle ?? "");
      setSeoDescription(data.seoDescription ?? "");
      setSeoKeywords(data.seoKeywords ?? "");
      setOgImageUrl(data.ogImageUrl ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [isAdmin, load]);

  const adsIdValid = googleAdsConversionId.trim() === "" || /^AW-\d+$/.test(googleAdsConversionId.trim());
  const reportUrlValid =
    googleAdsReportEmbedUrl.trim() === "" ||
    /^https:\/\/(lookerstudio|datastudio)\.google\.com\/embed\//.test(googleAdsReportEmbedUrl.trim());
  const bothValid = adsIdValid && reportUrlValid;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const data = await api<SiteSettings>("/api/site-settings", {
        method: "PATCH",
        body: JSON.stringify({
          googleRating: googleRating.trim(),
          googleReviewCount: googleReviewCount.trim() ? Number(googleReviewCount) : null,
          googleReviewsUrl: googleReviewsUrl.trim(),
          googleAnalyticsId: googleAnalyticsId.trim(),
          googleSiteVerification: googleSiteVerification.trim(),
          googleAdsConversionId: googleAdsConversionId.trim(),
          googleAdsConversionLabel: googleAdsConversionLabel.trim(),
          googleAdsReportEmbedUrl: googleAdsReportEmbedUrl.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          ogImageUrl: ogImageUrl.trim(),
        }),
      });
      setSettings(data);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const dirty = settings
    ? googleRating.trim() !== (settings.googleRating ?? "") ||
      (googleReviewCount.trim() ? Number(googleReviewCount) : null) !== settings.googleReviewCount ||
      googleReviewsUrl.trim() !== (settings.googleReviewsUrl ?? "") ||
      googleAnalyticsId.trim() !== (settings.googleAnalyticsId ?? "") ||
      googleSiteVerification.trim() !== (settings.googleSiteVerification ?? "") ||
      googleAdsConversionId.trim() !== (settings.googleAdsConversionId ?? "") ||
      googleAdsConversionLabel.trim() !== (settings.googleAdsConversionLabel ?? "") ||
      googleAdsReportEmbedUrl.trim() !== (settings.googleAdsReportEmbedUrl ?? "") ||
      seoTitle.trim() !== (settings.seoTitle ?? "") ||
      seoDescription.trim() !== (settings.seoDescription ?? "") ||
      seoKeywords.trim() !== (settings.seoKeywords ?? "") ||
      ogImageUrl.trim() !== (settings.ogImageUrl ?? "")
    : false;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink/60">
          Bu sayfayı görüntüleme yetkiniz yok. Google ayarlarını yalnızca yöneticiler değiştirebilir.
        </p>
      </div>
    );
  }

  if (loading) return <Loading />;

  const adsConnected = Boolean(settings?.googleAdsConversionId);
  const analyticsConnected = Boolean(settings?.googleAnalyticsId);
  const reportConnected = Boolean(settings?.googleAdsReportEmbedUrl);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <Icon name="target" className="h-5 w-5 text-brand" />
          Google
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Google Analytics, Arama Konsolu, Google Ads dönüşüm takibi ve SEO ayarlarını buradan
          yönetin. Reklam vermeden önce bu sayfadaki "Reklam Rehberi" sekmesini okuyun.
        </p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={active}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                active
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-ink/8 bg-white hover:border-brand/30 hover:bg-surface"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active ? "bg-brand text-white" : "bg-surface text-ink/50"
                }`}
              >
                <Icon name={t.icon} className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${active ? "text-brand" : "text-ink"}`}>
                  {t.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-ink/45">
                  {t.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {tab === "ayarlar" && (
        <>
          {error && <ErrorBox message={error} />}

          <form onSubmit={save} className="space-y-5">
            <div className="flex flex-wrap gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  analyticsConnected ? "bg-emerald-500/10 text-emerald-700" : "bg-ink/8 text-ink/50"
                }`}
              >
                <Icon name={analyticsConnected ? "check" : "close"} className="h-3.5 w-3.5" />
                Analytics {analyticsConnected ? "bağlı" : "bağlı değil"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  adsConnected ? "bg-emerald-500/10 text-emerald-700" : "bg-ink/8 text-ink/50"
                }`}
              >
                <Icon name={adsConnected ? "check" : "close"} className="h-3.5 w-3.5" />
                Google Ads dönüşümü {adsConnected ? "bağlı" : "bağlı değil"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  reportConnected ? "bg-emerald-500/10 text-emerald-700" : "bg-ink/8 text-ink/50"
                }`}
              >
                <Icon name={reportConnected ? "check" : "close"} className="h-3.5 w-3.5" />
                Performans raporu {reportConnected ? "bağlı" : "bağlı değil"}
              </span>
            </div>

            <Card title="Google Analytics (GA4)">
              <div className="space-y-5 p-5">
                <p className="text-xs text-ink/50">
                  Site trafiğini ve ziyaretçi davranışını ölçer. Reklam öncesi mutlaka kurulu
                  olmalı — bağlamadan reklam verirseniz hangi tıklamanın işe yaradığını göremezsiniz.
                </p>
                <Field label="Google Analytics 4 Ölçüm Kimliği">
                  <Input
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="mt-1.5 text-xs text-ink/40">
                    analytics.google.com → Yönetici → Veri Akışları → Ölçüm Kimliği.
                  </p>
                </Field>
              </div>
            </Card>

            <Card title="Google Ads Dönüşüm Takibi">
              <div className="space-y-5 p-5">
                <p className="text-xs text-ink/50">
                  Reklamdan gelen birinin "Ücretsiz Keşif" formunu doldurmasını bir{" "}
                  <strong>dönüşüm</strong> olarak sayar. Bu olmadan Google Ads'in otomatik teklif
                  stratejileri (TBM optimizasyonu dahil) doğru çalışamaz — mutlaka kurun.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Dönüşüm Kimliği">
                    <Input
                      value={googleAdsConversionId}
                      onChange={(e) => setGoogleAdsConversionId(e.target.value)}
                      placeholder="AW-123456789"
                    />
                    {!adsIdValid && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        AW- ile başlamalı, örn. AW-123456789
                      </p>
                    )}
                  </Field>
                  <Field label="Dönüşüm Etiketi (label)">
                    <Input
                      value={googleAdsConversionLabel}
                      onChange={(e) => setGoogleAdsConversionLabel(e.target.value)}
                      placeholder="AbCdEfGhIjKlMn"
                    />
                  </Field>
                </div>
                <p className="text-xs text-ink/40">
                  ads.google.com → Araçlar ve Ayarlar → Dönüşümler → Yeni dönüşüm işlemi →
                  "Web sitesi" → kurulum talimatlarının sonunda gösterilen{" "}
                  <code className="rounded bg-ink/5 px-1">AW-XXXXXXXXX</code> ve{" "}
                  <code className="rounded bg-ink/5 px-1">send_to</code> içindeki{" "}
                  <code className="rounded bg-ink/5 px-1">/XXXXXXXXXXXX</code> kısmı (label).
                  Kaydedince Keşif formu gönderildiğinde otomatik olarak Google'a bildirilir.
                </p>
              </div>
            </Card>

            <Card title="Google Ads Performans Raporu (Panel Ana Sayfası)">
              <div className="space-y-5 p-5">
                <p className="text-xs text-ink/50">
                  Tıklama, gösterim, maliyet ve dönüşüm gibi gerçek reklam performans verilerini
                  Panel ana sayfasında görmek için Google'ın ücretsiz{" "}
                  <strong>Looker Studio</strong> aracıyla bir rapor oluşturup buraya bağlayın:
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-xs text-ink/55">
                  <li>
                    <a
                      href="https://lookerstudio.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand hover:underline"
                    >
                      lookerstudio.google.com
                    </a>{" "}
                    → Boş rapor → Veri kaynağı olarak <strong>Google Ads</strong>'i seçip reklam
                    hesabınızı bağlayın.
                  </li>
                  <li>İstediğiniz tablo/grafikleri (tıklama, maliyet, dönüşüm vb.) ekleyin.</li>
                  <li>
                    Sağ üstten <strong>Paylaş → Raporu yerleştir (Embed report)</strong> → yerleştirmeyi
                    etkinleştirin → verilen linki kopyalayın.
                  </li>
                  <li>O linki aşağıya yapıştırıp kaydedin.</li>
                </ol>
                <Field label="Looker Studio embed linki">
                  <Input
                    value={googleAdsReportEmbedUrl}
                    onChange={(e) => setGoogleAdsReportEmbedUrl(e.target.value)}
                    placeholder="https://lookerstudio.google.com/embed/reporting/..."
                  />
                  {!reportUrlValid && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">
                      lookerstudio.google.com/embed/... ile başlayan bir link girin
                    </p>
                  )}
                </Field>
              </div>
            </Card>

            <Card title="Google Puanı & Yorumlar">
              <div className="space-y-5 p-5">
                <p className="text-xs text-ink/50">
                  Sitedeki rozetlerde ve arama motoru sonuçlarında (schema.org) gösterilir.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Google puanı">
                    <Input value={googleRating} onChange={(e) => setGoogleRating(e.target.value)} placeholder="5.0" />
                  </Field>
                  <Field label="Yorum sayısı">
                    <Input
                      type="number"
                      min="0"
                      value={googleReviewCount}
                      onChange={(e) => setGoogleReviewCount(e.target.value)}
                      placeholder="33"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Google yorumları linki">
                      <Input
                        value={googleReviewsUrl}
                        onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                        placeholder="https://www.google.com/maps/search/?api=1&query=..."
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Arama Konsolu (Search Console)">
              <div className="space-y-5 p-5">
                <Field label="Google Search Console doğrulama kodu">
                  <Input
                    value={googleSiteVerification}
                    onChange={(e) => setGoogleSiteVerification(e.target.value)}
                    placeholder="abc123..."
                  />
                  <p className="mt-1.5 text-xs text-ink/40">
                    search.google.com/search-console → Mülk ekle → HTML etiketi doğrulama →
                    <code className="mx-1 rounded bg-ink/5 px-1">content=&quot;...&quot;</code>
                    içindeki kodu yapıştırın.
                  </p>
                </Field>
              </div>
            </Card>

            <Card title="SEO Ayarları">
              <div className="space-y-5 p-5">
                <p className="text-xs text-ink/50">
                  Anasayfanın Google&apos;da ve WhatsApp/sosyal medya paylaşımlarında görünen
                  başlık/açıklama/görseli. Boş bırakılırsa mevcut varsayılanlar kullanılır.
                </p>
                <Field label="SEO başlığı">
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Öztürk Güvenlik Sistemleri | Güvenlik Kamerası, Alarm, PDKS — İstanbul"
                    maxLength={200}
                  />
                </Field>
                <Field label="SEO açıklaması">
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={300}
                    rows={2}
                    className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-brand"
                    placeholder="İstanbul genelinde güvenlik kamerası, alarm, PDKS sistemleri. Ücretsiz keşif."
                  />
                </Field>
                <Field label="Anahtar kelimeler (virgülle ayrılmış)">
                  <Input
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="güvenlik kamerası istanbul, hırsız alarmı, pdks"
                  />
                </Field>
                <Field label="Sosyal paylaşım görseli (yol veya tam URL)">
                  <Input
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="/images/hero-1.jpg"
                  />
                  <p className="mt-1.5 text-xs text-ink/40">
                    WhatsApp/Facebook paylaşımlarında görünen görsel — herkese açık bir görsel
                    olmalı (özel/gizli dosya olamaz).
                  </p>
                </Field>
              </div>
            </Card>

            <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-5 shadow-lg">
              <Btn type="submit" disabled={saving || !bothValid || !dirty}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
              {saved && !dirty && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <Icon name="check" className="h-4 w-4" />
                  Kaydedildi
                </span>
              )}
              {dirty && (
                <span className="ml-auto text-xs font-semibold text-amber-600">
                  Kaydedilmemiş değişiklikler var
                </span>
              )}
            </div>
          </form>
        </>
      )}

      {tab === "rehber" && <AdsGuide />}
    </div>
  );
}

function GuideStep({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
        <Icon name="check" className="h-3.5 w-3.5" />
      </span>
      <div className="text-sm text-ink/75">{children}</div>
    </div>
  );
}

function AdsGuide() {
  return (
    <div className="space-y-5">
      <Card title="Doğru Kampanya Türü ve Teklif Stratejisi (TBM)">
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink/70">
            Bu site için en doğru başlangıç, Google Ads&apos;te bir <strong>Arama (Search)
            kampanyası</strong> açıp teklif stratejisini <strong>TBM — Tıklama Başı Maliyet
            (Manuel veya Geliştirilmiş TBM)</strong> olarak ayarlamaktır. Bu, reklam bütçesinin
            gösterim başına değil, sitenize gelen her tıklama başına harcanması demektir —
            siz talep oluşana kadar (keşif formu / telefon) para harcamamış olursunuz.
          </p>
          <div className="space-y-3 rounded-xl bg-surface p-4">
            <GuideStep>
              <strong>Kampanya hedefi:</strong> "Potansiyel müşteri" (Leads) seçin, "Satış" ya da
              "Marka bilinirliği" değil — bu site bir form/telefon ile talep topluyor, e-ticaret
              yapmıyor.
            </GuideStep>
            <GuideStep>
              <strong>Kampanya türü:</strong> Arama (Search). Performance Max veya Görüntülü Reklam
              ağı, bu aşamada bütçeyi dağıtır ve niyeti düşük trafik getirir — önce Arama ile
              başlayın.
            </GuideStep>
            <GuideStep>
              <strong>Teklif stratejisi:</strong> "Tıklama sayısını en üst düzeye çıkar" (Maximize
              Clicks) ile başlayıp isteğe bağlı bir <strong>maksimum TBM sınırı</strong> girin (ör.
              15–25 ₺). 30-50 dönüşüm biriktikten sonra "Dönüşümleri en üst düzeye çıkar" gibi
              otomatik stratejilere geçmeyi değerlendirin — ama bu geçiş için{" "}
              <strong>dönüşüm takibinin</strong> (bu sayfanın "Ayarlar" sekmesi) kurulu olması
              şart.
            </GuideStep>
            <GuideStep>
              <strong>Konum hedefleme:</strong> Yenibosna / Bahçelievler merkezli olarak İstanbul
              geneli, yarıçap hedeflemesi (ör. 25-30 km) kullanın — tüm Türkiye&apos;yi hedeflemek
              bütçeyi israf eder.
            </GuideStep>
            <GuideStep>
              <strong>Anahtar kelime eşleme türü:</strong> "Tam eşleme" ve "Sıralı eşleme" ağırlıklı
              başlayın (ör. [güvenlik kamerası istanbul], "hırsız alarmı fiyat"); geniş eşlemeyi
              negatif anahtar kelime listesi olmadan kullanmayın.
            </GuideStep>
          </div>
        </div>
      </Card>

      <Card title="Reklamın Doğru Çıkması İçin Teknik Kontrol Listesi">
        <div className="space-y-3 p-5">
          <GuideStep>
            <strong>Final URL = ozturkguvenlik.com.</strong> Reklamda kullanılacak site, Site
            Ayarları&apos;ndan değil, bu sitenin kendisinden (www.ozturkguvenlik.com) olmalı —
            canonical/sitemap zaten bu domaine göre yapılandırıldı.
          </GuideStep>
          <GuideStep>
            <strong>Dönüşüm takibi aktif olmalı</strong> (yukarıdaki "Ayarlar" sekmesi) — reklam
            onaya gitmeden önce Google Tag Assistant veya Ads&apos;teki "Etiket sağlığı" ekranından
            doğrulayın.
          </GuideStep>
          <GuideStep>
            <strong>Site Bağlantıları (Sitelink), Çağrı (Call) ve Konum (Location) uzantılarını</strong>{" "}
            ekleyin — reklamın kapladığı alanı büyütür, tıklama oranını (TO) yükseltir ve TBM&apos;yi
            düşürür.
          </GuideStep>
          <GuideStep>
            <strong>Açılış sayfası hızlı ve mobil uyumlu olmalı</strong> — bu site zaten Next.js ile
            sunucu tarafında render ediliyor ve mobil uyumlu; ek bir şey yapmanıza gerek yok.
          </GuideStep>
          <GuideStep>
            <strong>Gizlilik/KVKK sayfası</strong> olmadan form toplayan sitelerde Google bazen
            reklamı inceleme/reddetme sürecine alabilir — bu konuda ayrıca bilgilendirme
            yapılacaktır.
          </GuideStep>
        </div>
      </Card>

      <Card title="TBM Ne Demek, Neden Önerildi?">
        <div className="space-y-2 p-5 text-sm text-ink/70">
          <p>
            <strong>TBM (Tıklama Başı Maliyet / CPC):</strong> Reklamınız binlerce kişiye
            gösterilse de ücret ödemezsiniz — yalnızca biri reklama <strong>tıklayıp</strong>{" "}
            sitenize geldiğinde ödeme yaparsınız. Gösterim başına ödenen modele (TBG/CPM) göre bu,
            yeni başlayan ve bütçesini "gerçek ilgiden" harcamak isteyen işletmeler için (tam da bu
            durum) daha az risklidir.
          </p>
          <p>
            Kampanyanın <strong>Teklif Stratejisi</strong> ayarında "Tıklama sayısını en üst düzeye
            çıkar" seçeneği TBM tabanlıdır ve Google Ads&apos;in varsayılan önerisi genelde TBG
            olmadığından, kurulumda bunu açıkça seçmeniz gerekir.
          </p>
        </div>
      </Card>
    </div>
  );
}
