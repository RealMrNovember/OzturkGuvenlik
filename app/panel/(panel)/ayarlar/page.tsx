"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { Btn, Card, ErrorBox, Field, Input, Loading } from "@/components/panel/ui";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_THICKNESS,
  DEFAULT_BRAND_COLOR,
  DEFAULT_BRAND_LIGHT_COLOR,
} from "@/lib/db/schema";
import { extractYouTubeId, youtubeThumbnailUrl } from "@/lib/youtube";
import type { IconName } from "@/lib/services";

type SitePhone = { label: string; number: string };

type TabKey = "gorunum" | "iletisim" | "sosyal" | "seo";

const TABS: { key: TabKey; label: string; icon: IconName; desc: string }[] = [
  { key: "gorunum", label: "Görünüm", icon: "palette", desc: "Tema renkleri, vurgu çerçevesi, hero videosu" },
  { key: "iletisim", label: "İletişim", icon: "phone", desc: "Telefonlar, e-posta, adres, harita linki" },
  { key: "sosyal", label: "Sosyal Medya & WhatsApp", icon: "whatsapp", desc: "Instagram, Facebook, WhatsApp" },
  { key: "seo", label: "SEO & Google", icon: "search", desc: "Google puanı, Analytics, Search Console, SEO" },
];

type SiteSettings = {
  id: number;
  brandColor: string;
  brandLightColor: string;
  accentColor: string;
  accentThickness: number;
  heroVideoUrl: string | null;
  heroVideoAutoplay: boolean;
  heroVideoMuted: boolean;
  heroVideoStart: number;
  heroVideoDuration: number | null;
  phones: SitePhone[];
  contactEmail: string | null;
  address: string | null;
  mapLink: string | null;
  mapEmbedUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappNumber: string | null;
  whatsappDefaultText: string | null;
  googleRating: string | null;
  googleReviewCount: number | null;
  googleReviewsUrl: string | null;
  googleAnalyticsId: string | null;
  googleSiteVerification: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  updatedAt: string;
};

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

function ColorField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const valid = HEX_REGEX.test(value);
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
          aria-label={`${label} renk seçici`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={7}
          className="font-mono uppercase"
        />
      </div>
      {!valid && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          Geçerli bir hex renk kodu girin (örn. #0E6FB8)
        </p>
      )}
    </Field>
  );
}

export default function SiteAyarlariPage() {
  const isAdmin = usePanelCan("manage_settings");

  const [tab, setTab] = useState<TabKey>("gorunum");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
  const [brandLightColor, setBrandLightColor] = useState(DEFAULT_BRAND_LIGHT_COLOR);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [accentThickness, setAccentThickness] = useState(String(DEFAULT_ACCENT_THICKNESS));
  const [heroVideoUrl, setHeroVideoUrl] = useState("");
  const [heroVideoAutoplay, setHeroVideoAutoplay] = useState(true);
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);
  const [heroVideoStart, setHeroVideoStart] = useState("0");
  const [heroVideoDuration, setHeroVideoDuration] = useState("");

  const [phones, setPhones] = useState<SitePhone[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappDefaultText, setWhatsappDefaultText] = useState("");
  const [googleRating, setGoogleRating] = useState("");
  const [googleReviewCount, setGoogleReviewCount] = useState("");
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");
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
      setBrandColor(data.brandColor);
      setBrandLightColor(data.brandLightColor);
      setAccentColor(data.accentColor);
      setAccentThickness(String(data.accentThickness));
      setHeroVideoUrl(data.heroVideoUrl ?? "");
      setHeroVideoAutoplay(data.heroVideoAutoplay);
      setHeroVideoMuted(data.heroVideoMuted);
      setHeroVideoStart(String(data.heroVideoStart));
      setHeroVideoDuration(data.heroVideoDuration ? String(data.heroVideoDuration) : "");
      setPhones(Array.isArray(data.phones) ? data.phones : []);
      setContactEmail(data.contactEmail ?? "");
      setAddress(data.address ?? "");
      setMapLink(data.mapLink ?? "");
      setMapEmbedUrl(data.mapEmbedUrl ?? "");
      setInstagramUrl(data.instagramUrl ?? "");
      setFacebookUrl(data.facebookUrl ?? "");
      setWhatsappNumber(data.whatsappNumber ?? "");
      setWhatsappDefaultText(data.whatsappDefaultText ?? "");
      setGoogleRating(data.googleRating ?? "");
      setGoogleReviewCount(data.googleReviewCount != null ? String(data.googleReviewCount) : "");
      setGoogleReviewsUrl(data.googleReviewsUrl ?? "");
      setGoogleAnalyticsId(data.googleAnalyticsId ?? "");
      setGoogleSiteVerification(data.googleSiteVerification ?? "");
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

  const videoId = extractYouTubeId(heroVideoUrl);
  const heroVideoUrlValid = heroVideoUrl.trim() === "" || videoId !== null;
  const startNum = Number(heroVideoStart) || 0;
  const durationNum = heroVideoDuration ? Number(heroVideoDuration) : null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const data = await api<SiteSettings>("/api/site-settings", {
        method: "PATCH",
        body: JSON.stringify({
          brandColor,
          brandLightColor,
          accentColor,
          accentThickness: Number(accentThickness) || DEFAULT_ACCENT_THICKNESS,
          heroVideoUrl: heroVideoUrl.trim(),
          heroVideoAutoplay,
          heroVideoMuted,
          heroVideoStart: startNum,
          heroVideoDuration: durationNum,
          phones: phones.map((p) => ({ label: p.label.trim(), number: p.number.trim() })).filter((p) => p.number),
          contactEmail: contactEmail.trim(),
          address: address.trim(),
          mapLink: mapLink.trim(),
          mapEmbedUrl: mapEmbedUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          whatsappNumber: whatsappNumber.trim(),
          whatsappDefaultText: whatsappDefaultText.trim(),
          googleRating: googleRating.trim(),
          googleReviewCount: googleReviewCount.trim() ? Number(googleReviewCount) : null,
          googleReviewsUrl: googleReviewsUrl.trim(),
          googleAnalyticsId: googleAnalyticsId.trim(),
          googleSiteVerification: googleSiteVerification.trim(),
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          ogImageUrl: ogImageUrl.trim(),
        }),
      });
      setSettings(data);
      setAccentThickness(String(data.accentThickness));
      setHeroVideoStart(String(data.heroVideoStart));
      setPhones(Array.isArray(data.phones) ? data.phones : []);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setBrandColor(DEFAULT_BRAND_COLOR);
    setBrandLightColor(DEFAULT_BRAND_LIGHT_COLOR);
    setAccentColor(DEFAULT_ACCENT_COLOR);
    setAccentThickness(String(DEFAULT_ACCENT_THICKNESS));
    setHeroVideoUrl("");
    setHeroVideoAutoplay(true);
    setHeroVideoMuted(true);
    setHeroVideoStart("0");
    setHeroVideoDuration("");
    setSaved(false);
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink/60">
          Bu sayfayı görüntüleme yetkiniz yok. Site ayarlarını yalnızca yöneticiler değiştirebilir.
        </p>
      </div>
    );
  }

  if (loading) return <Loading />;

  const thicknessNum = Number(accentThickness);
  const thicknessValid = Number.isInteger(thicknessNum) && thicknessNum >= 1 && thicknessNum <= 12;
  const bothValid =
    HEX_REGEX.test(brandColor) &&
    HEX_REGEX.test(brandLightColor) &&
    HEX_REGEX.test(accentColor) &&
    thicknessValid &&
    heroVideoUrlValid;
  const dirty = settings
    ? brandColor !== settings.brandColor ||
      brandLightColor !== settings.brandLightColor ||
      accentColor !== settings.accentColor ||
      thicknessNum !== settings.accentThickness ||
      heroVideoUrl.trim() !== (settings.heroVideoUrl ?? "") ||
      heroVideoAutoplay !== settings.heroVideoAutoplay ||
      heroVideoMuted !== settings.heroVideoMuted ||
      startNum !== settings.heroVideoStart ||
      durationNum !== settings.heroVideoDuration ||
      JSON.stringify(phones) !== JSON.stringify(settings.phones ?? []) ||
      contactEmail.trim() !== (settings.contactEmail ?? "") ||
      address.trim() !== (settings.address ?? "") ||
      mapLink.trim() !== (settings.mapLink ?? "") ||
      mapEmbedUrl.trim() !== (settings.mapEmbedUrl ?? "") ||
      instagramUrl.trim() !== (settings.instagramUrl ?? "") ||
      facebookUrl.trim() !== (settings.facebookUrl ?? "") ||
      whatsappNumber.trim() !== (settings.whatsappNumber ?? "") ||
      whatsappDefaultText.trim() !== (settings.whatsappDefaultText ?? "") ||
      googleRating.trim() !== (settings.googleRating ?? "") ||
      (googleReviewCount.trim() ? Number(googleReviewCount) : null) !== settings.googleReviewCount ||
      googleReviewsUrl.trim() !== (settings.googleReviewsUrl ?? "") ||
      googleAnalyticsId.trim() !== (settings.googleAnalyticsId ?? "") ||
      googleSiteVerification.trim() !== (settings.googleSiteVerification ?? "") ||
      seoTitle.trim() !== (settings.seoTitle ?? "") ||
      seoDescription.trim() !== (settings.seoDescription ?? "") ||
      seoKeywords.trim() !== (settings.seoKeywords ?? "") ||
      ogImageUrl.trim() !== (settings.ogImageUrl ?? "")
    : false;

  const addPhone = () => setPhones((prev) => [...prev, { label: "", number: "" }]);
  const removePhone = (idx: number) => setPhones((prev) => prev.filter((_, i) => i !== idx));
  const updatePhone = (idx: number, patch: Partial<SitePhone>) =>
    setPhones((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  const isDefault =
    brandColor.toLowerCase() === DEFAULT_BRAND_COLOR &&
    brandLightColor.toLowerCase() === DEFAULT_BRAND_LIGHT_COLOR &&
    accentColor.toLowerCase() === DEFAULT_ACCENT_COLOR &&
    thicknessNum === DEFAULT_ACCENT_THICKNESS &&
    heroVideoUrl.trim() === "" &&
    heroVideoAutoplay === true &&
    heroVideoMuted === true &&
    startNum === 0 &&
    durationNum === null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <Icon name="palette" className="h-5 w-5 text-brand" />
          Site Ayarları
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Sitenin görünümünü, iletişim bilgilerini, sosyal medya hesaplarını ve SEO/Google
          ayarlarını buradan yönetin. Değişiklikler hem web sitesine hem panele anında yansır.
        </p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

      {error && <ErrorBox message={error} />}

      <form onSubmit={save} className="space-y-5">
        {tab === "gorunum" && (
        <>
        <Card title="Tema Renkleri">
          <div className="space-y-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Ana marka rengi"
                value={brandColor}
                placeholder="#0E6FB8"
                onChange={setBrandColor}
              />
              <ColorField
                label="Açık / ikincil renk"
                value={brandLightColor}
                placeholder="#40A0E0"
                onChange={setBrandLightColor}
              />
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink/70">Önizleme</span>
              <div
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 p-5"
                style={{ background: HEX_REGEX.test(brandColor) ? brandColor : undefined }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md"
                  style={{ background: HEX_REGEX.test(brandLightColor) ? brandLightColor : "#999" }}
                >
                  Ücretsiz Keşif Başlat
                </span>
                <span className="text-sm font-medium text-white/90">
                  Buton ve vurgu renkleri böyle görünecek
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Vurgu Çerçeve Efekti">
          <div className="space-y-5 p-5">
            <p className="text-xs text-ink/50">
              Hero görseli, kartlar ve bölüm başlıkları etrafındaki ince renkli şerit/çerçeve
              efektinin rengi ve kalınlığı.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <ColorField
                label="Çerçeve rengi"
                value={accentColor}
                placeholder="#E63946"
                onChange={setAccentColor}
              />
              <Field label="Çerçeve kalınlığı (px)">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={accentThickness}
                  onChange={(e) => setAccentThickness(e.target.value)}
                />
                {!thicknessValid && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">1 ile 12 px arası olmalı</p>
                )}
              </Field>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink/70">Önizleme</span>
              <div
                className="h-24 rounded-2xl bg-surface"
                style={{
                  border: HEX_REGEX.test(accentColor)
                    ? `${thicknessValid ? thicknessNum : 3}px solid ${accentColor}`
                    : undefined,
                }}
              />
            </div>
          </div>
        </Card>

        <Card title="Hero Videosu">
          <div className="space-y-5 p-5">
            <p className="text-xs text-ink/50">
              Anasayfa giriş bölümüne bir YouTube videosu ekleyin. Link boş bırakılırsa mevcut
              görsel kullanılmaya devam eder.
            </p>
            <Field label="YouTube linki">
              <Input
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {!heroVideoUrlValid && (
                <p className="mt-1.5 text-xs font-medium text-red-500">Geçerli bir YouTube linki girin</p>
              )}
            </Field>

            {videoId && (
              <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumbnailUrl(videoId)}
                  alt=""
                  className="h-14 w-24 shrink-0 rounded-lg object-cover"
                />
                <p className="text-xs font-medium text-ink/60">Video algılandı, hero&apos;da oynatılacak.</p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <input
                  type="checkbox"
                  checked={heroVideoAutoplay}
                  onChange={(e) => setHeroVideoAutoplay(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Otomatik oynat
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <input
                  type="checkbox"
                  checked={heroVideoMuted}
                  onChange={(e) => setHeroVideoMuted(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Sessiz başlat
              </label>
              <Field label="Başlangıç saniyesi">
                <Input
                  type="number"
                  min="0"
                  value={heroVideoStart}
                  onChange={(e) => setHeroVideoStart(e.target.value)}
                />
              </Field>
              <Field label="Süre (saniye, boşsa videonun tamamı)">
                <Input
                  type="number"
                  min="1"
                  value={heroVideoDuration}
                  onChange={(e) => setHeroVideoDuration(e.target.value)}
                  placeholder="Örn. 12"
                />
              </Field>
            </div>
            <p className="text-xs text-ink/40">
              Tarayıcılar güvenlik gereği sesli otomatik oynatmaya genelde izin vermez — "Sessiz
              başlat" kapalıyken video otomatik oynasa da ilk kullanıcı etkileşimine kadar sessiz
              kalabilir.
            </p>
          </div>
        </Card>
        </>
        )}

        {tab === "iletisim" && (
        <Card title="İletişim Bilgileri">
          <div className="space-y-5 p-5">
            <p className="text-xs text-ink/50">
              Sitede ve panelde gösterilen telefon(lar), e-posta ve adres. Boş bırakılan alanlar
              mevcut varsayılan değerleri kullanmaya devam eder.
            </p>

            <div>
              <span className="mb-2 block text-xs font-semibold text-ink/70">Telefon Numaraları</span>
              <div className="space-y-2">
                {phones.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={p.label}
                      onChange={(e) => updatePhone(i, { label: e.target.value })}
                      placeholder="Etiket (örn: Satış) — opsiyonel"
                      className="w-48"
                    />
                    <Input
                      value={p.number}
                      onChange={(e) => updatePhone(i, { number: e.target.value })}
                      placeholder="0535 014 65 93"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(i)}
                      aria-label="Numarayı kaldır"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPhone}
                className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <Icon name="plus" className="h-4 w-4" />
                Numara ekle
              </button>
              {phones.length === 0 && (
                <p className="mt-1.5 text-xs text-ink/40">
                  Hiç eklenmezse mevcut varsayılan numaralar kullanılır.
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="E-posta">
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="guvenlikozturk@gmail.com"
                />
              </Field>
              <Field label="Adres">
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Yenibosna Merkez Mahallesi, Kenanbey Sokak No: 11"
                />
              </Field>
              <Field label="Google Haritalar linki (yol tarifi)">
                <Input
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                />
              </Field>
              <Field label="Google Haritalar yerleştirme (embed) linki">
                <Input
                  value={mapEmbedUrl}
                  onChange={(e) => setMapEmbedUrl(e.target.value)}
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                />
                <p className="mt-1.5 text-xs text-ink/40">
                  Google Haritalar&apos;da adresi arayın → Paylaş → Harita Yerleştir → linki
                  buraya yapıştırın.
                </p>
              </Field>
            </div>
          </div>
        </Card>
        )}

        {tab === "sosyal" && (
        <Card title="Sosyal Medya & WhatsApp">
          <div className="space-y-5 p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Instagram linki">
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/..."
                />
              </Field>
              <Field label="Facebook linki">
                <Input
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/..."
                />
              </Field>
              <Field label="WhatsApp numarası (ülke koduyla, boşluksuz)">
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="905350146593"
                />
              </Field>
              <Field label="WhatsApp varsayılan mesajı">
                <Input
                  value={whatsappDefaultText}
                  onChange={(e) => setWhatsappDefaultText(e.target.value)}
                  placeholder="Merhabalar, güvenlik sistemleri için fiyat almak istiyorum."
                />
              </Field>
            </div>
          </div>
        </Card>
        )}

        {tab === "seo" && (
        <>
        <Card title="Google Ayarları">
          <div className="space-y-5 p-5">
            <p className="text-xs text-ink/50">
              Puan/yorum sayısı sitedeki rozetlerde ve arama motoru sonuçlarında (schema.org)
              gösterilir. Analytics ve Search Console alanları doldurulunca otomatik devreye
              girer — kod değişikliği gerekmez.
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
        </>
        )}

        <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-5 shadow-lg">
          <Btn type="submit" disabled={saving || !bothValid || !dirty}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Btn>
          {tab === "gorunum" && (
            <Btn variant="ghost" type="button" onClick={resetToDefault} disabled={saving || isDefault}>
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Varsayılana Sıfırla
            </Btn>
          )}
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
    </div>
  );
}
