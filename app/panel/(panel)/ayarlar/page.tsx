"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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
import { HERO_SIZES, HERO_SIZE_LABELS, HERO_SIZE_DESCRIPTIONS, toHeroSize, type HeroSize, type HeroVideo } from "@/lib/hero-size";
import type { IconName } from "@/lib/services";
import { isEmbeddableMapUrl } from "@/lib/map-embed";
import { DEFAULT_GALLERY_ITEMS, isGalleryBlobUrl, type GalleryItem } from "@/lib/gallery";

type SitePhone = { label: string; number: string };

type TabKey = "gorunum" | "iletisim" | "sosyal";

const TABS: { key: TabKey; label: string; icon: IconName; desc: string }[] = [
  { key: "gorunum", label: "Görünüm", icon: "palette", desc: "Tema renkleri, vurgu çerçevesi, hero videoları" },
  { key: "iletisim", label: "İletişim", icon: "phone", desc: "Telefonlar, e-posta, adres, harita linki" },
  { key: "sosyal", label: "Sosyal Medya & WhatsApp", icon: "whatsapp", desc: "Instagram, Facebook, WhatsApp" },
];

type SiteSettings = {
  id: number;
  brandColor: string;
  brandLightColor: string;
  accentColor: string;
  accentThickness: number;
  heroVideos: HeroVideo[];
  heroVideoAutoplay: boolean;
  heroVideoMuted: boolean;
  heroSize: string;
  galleryItems: GalleryItem[];
  phones: SitePhone[];
  contactEmail: string | null;
  address: string | null;
  mapLink: string | null;
  mapEmbedUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  whatsappNumber: string | null;
  whatsappDefaultText: string | null;
  whatsappFloatLabel: string | null;
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
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [heroVideoAutoplay, setHeroVideoAutoplay] = useState(true);
  const [heroVideoMuted, setHeroVideoMuted] = useState(true);
  const [heroSize, setHeroSize] = useState<HeroSize>("normal");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const [phones, setPhones] = useState<SitePhone[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappDefaultText, setWhatsappDefaultText] = useState("");
  const [whatsappFloatLabel, setWhatsappFloatLabel] = useState("");

  const [loading, setLoading] = useState(() => isAdmin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<SiteSettings>("/api/site-settings");
      setSettings(data);
      setBrandColor(data.brandColor);
      setBrandLightColor(data.brandLightColor);
      setAccentColor(data.accentColor);
      setAccentThickness(String(data.accentThickness));
      setHeroVideos(Array.isArray(data.heroVideos) ? data.heroVideos : []);
      setHeroVideoAutoplay(data.heroVideoAutoplay);
      setHeroVideoMuted(data.heroVideoMuted);
      setHeroSize(toHeroSize(data.heroSize));
      // Boşsa, sitede hâlihazırda görünen varsayılan 3 görseli doğrudan
      // düzenlenebilir hâlde gösteriyoruz — admin boş bir liste değil,
      // sitede gerçekten yayında olanı görsün istiyoruz.
      setGalleryItems(
        Array.isArray(data.galleryItems) && data.galleryItems.length > 0
          ? data.galleryItems
          : DEFAULT_GALLERY_ITEMS
      );
      setPhones(Array.isArray(data.phones) ? data.phones : []);
      setContactEmail(data.contactEmail ?? "");
      setAddress(data.address ?? "");
      setMapLink(data.mapLink ?? "");
      setMapEmbedUrl(data.mapEmbedUrl ?? "");
      setInstagramUrl(data.instagramUrl ?? "");
      setFacebookUrl(data.facebookUrl ?? "");
      setYoutubeUrl(data.youtubeUrl ?? "");
      setTiktokUrl(data.tiktokUrl ?? "");
      setWhatsappNumber(data.whatsappNumber ?? "");
      setWhatsappDefaultText(data.whatsappDefaultText ?? "");
      setWhatsappFloatLabel(data.whatsappFloatLabel ?? "");
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

  const heroVideosValid = heroVideos.every((v) => extractYouTubeId(v.url) !== null);
  const addHeroVideo = () => setHeroVideos((prev) => [...prev, { url: "" }]);
  const removeHeroVideo = (idx: number) => setHeroVideos((prev) => prev.filter((_, i) => i !== idx));
  const updateHeroVideo = (idx: number, patch: Partial<HeroVideo>) =>
    setHeroVideos((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));

  const addGalleryItem = (imageUrl: string) =>
    setGalleryItems((prev) => [...prev, { imageUrl, caption: "" }]);
  const removeGalleryItem = (idx: number) => setGalleryItems((prev) => prev.filter((_, i) => i !== idx));
  const updateGalleryItem = (idx: number, patch: Partial<GalleryItem>) =>
    setGalleryItems((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));

  const uploadGalleryImage = async (file: File) => {
    setGalleryUploading(true);
    setGalleryError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/site-settings/gallery-image", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız");
      addGalleryItem(json.data.imageUrl as string);
    } catch (err) {
      setGalleryError((err as Error).message || "Yükleme başarısız");
    } finally {
      setGalleryUploading(false);
    }
  };
  const handleGalleryFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadGalleryImage(file);
  };

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
          heroVideos: heroVideos
            .map((v) => ({ ...v, url: v.url.trim() }))
            .filter((v) => v.url),
          heroVideoAutoplay,
          heroVideoMuted,
          heroSize,
          galleryItems: galleryItems
            .map((g) => ({ imageUrl: g.imageUrl.trim(), caption: g.caption.trim() }))
            .filter((g) => g.imageUrl),
          phones: phones.map((p) => ({ label: p.label.trim(), number: p.number.trim() })).filter((p) => p.number),
          contactEmail: contactEmail.trim(),
          address: address.trim(),
          mapLink: mapLink.trim(),
          mapEmbedUrl: mapEmbedUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          facebookUrl: facebookUrl.trim(),
          youtubeUrl: youtubeUrl.trim(),
          tiktokUrl: tiktokUrl.trim(),
          whatsappNumber: whatsappNumber.trim(),
          whatsappDefaultText: whatsappDefaultText.trim(),
          whatsappFloatLabel: whatsappFloatLabel.trim(),
        }),
      });
      setSettings(data);
      setAccentThickness(String(data.accentThickness));
      setHeroVideos(Array.isArray(data.heroVideos) ? data.heroVideos : []);
      setGalleryItems(
        Array.isArray(data.galleryItems) && data.galleryItems.length > 0
          ? data.galleryItems
          : DEFAULT_GALLERY_ITEMS
      );
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
    setHeroVideos([]);
    setHeroVideoAutoplay(true);
    setHeroVideoMuted(true);
    setHeroSize("normal");
    setGalleryItems(DEFAULT_GALLERY_ITEMS);
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
    heroVideosValid;
  const dirty = settings
    ? brandColor !== settings.brandColor ||
      brandLightColor !== settings.brandLightColor ||
      accentColor !== settings.accentColor ||
      thicknessNum !== settings.accentThickness ||
      JSON.stringify(heroVideos) !== JSON.stringify(settings.heroVideos ?? []) ||
      heroVideoAutoplay !== settings.heroVideoAutoplay ||
      heroVideoMuted !== settings.heroVideoMuted ||
      heroSize !== toHeroSize(settings.heroSize) ||
      JSON.stringify(galleryItems) !==
        JSON.stringify(
          settings.galleryItems && settings.galleryItems.length > 0
            ? settings.galleryItems
            : DEFAULT_GALLERY_ITEMS
        ) ||
      JSON.stringify(phones) !== JSON.stringify(settings.phones ?? []) ||
      contactEmail.trim() !== (settings.contactEmail ?? "") ||
      address.trim() !== (settings.address ?? "") ||
      mapLink.trim() !== (settings.mapLink ?? "") ||
      mapEmbedUrl.trim() !== (settings.mapEmbedUrl ?? "") ||
      instagramUrl.trim() !== (settings.instagramUrl ?? "") ||
      facebookUrl.trim() !== (settings.facebookUrl ?? "") ||
      youtubeUrl.trim() !== (settings.youtubeUrl ?? "") ||
      tiktokUrl.trim() !== (settings.tiktokUrl ?? "") ||
      whatsappNumber.trim() !== (settings.whatsappNumber ?? "") ||
      whatsappDefaultText.trim() !== (settings.whatsappDefaultText ?? "") ||
      whatsappFloatLabel.trim() !== (settings.whatsappFloatLabel ?? "")
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
    heroVideos.length === 0 &&
    heroVideoAutoplay === true &&
    heroVideoMuted === true &&
    heroSize === "normal" &&
    JSON.stringify(galleryItems) === JSON.stringify(DEFAULT_GALLERY_ITEMS);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <Icon name="palette" className="h-5 w-5 text-brand" />
          Site Ayarları
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Sitenin görünümünü, iletişim bilgilerini ve sosyal medya hesaplarını buradan yönetin.
          SEO, Google Analytics, Arama Konsolu ve reklam ayarları artık{" "}
          <span className="font-semibold text-ink">Google</span> menüsünde. Değişiklikler hem web
          sitesine hem panele anında yansır.
        </p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-3">
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

        <Card title="Hero Videoları (Slider)">
          <div className="space-y-5 p-5">
            <p className="text-xs text-ink/50">
              Anasayfa giriş bölümüne bir veya birden fazla YouTube videosu ekleyin. Birden fazla
              eklerseniz sırayla, otomatik geçişli bir slider olarak oynatılır. Hiç video
              eklenmezse mevcut görsel kullanılır.
            </p>

            <div className="space-y-3">
              {heroVideos.map((v, i) => {
                const vId = extractYouTubeId(v.url);
                const vValid = v.url.trim() === "" || vId !== null;
                return (
                  <div key={i} className="rounded-xl border border-ink/10 p-3.5">
                    <div className="flex items-start gap-2">
                      {vId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={youtubeThumbnailUrl(vId)}
                          alt=""
                          className="h-12 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-surface text-ink/30">
                          <Icon name="video" className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <Input
                          value={v.url}
                          onChange={(e) => updateHeroVideo(i, { url: e.target.value })}
                          placeholder={`https://www.youtube.com/watch?v=... (Video ${i + 1})`}
                        />
                        {!vValid && (
                          <p className="text-xs font-medium text-red-500">Geçerli bir YouTube linki girin</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          <Input
                            type="number"
                            min="0"
                            value={v.start ?? ""}
                            onChange={(e) =>
                              updateHeroVideo(i, { start: e.target.value ? Number(e.target.value) : undefined })
                            }
                            placeholder="Başlangıç (sn)"
                          />
                          <Input
                            type="number"
                            min="1"
                            value={v.duration ?? ""}
                            disabled={Boolean(v.repeatCount)}
                            onChange={(e) =>
                              updateHeroVideo(i, { duration: e.target.value ? Number(e.target.value) : undefined })
                            }
                            placeholder="Gösterim süresi (sn)"
                            className={v.repeatCount ? "opacity-40" : ""}
                          />
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={v.repeatCount ?? ""}
                            onChange={(e) =>
                              updateHeroVideo(i, {
                                repeatCount: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="Tur sayısı (örn. 2)"
                          />
                        </div>
                        <p className="text-xs text-ink/40">
                          "Tur sayısı" doldurulursa video gerçekten o kadar kez oynatılıp sonra bir
                          sonrakine geçilir (gösterim süresi alanı bu durumda kullanılmaz); boş
                          bırakılırsa eski "gösterim süresi" davranışı geçerli olur.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHeroVideo(i)}
                        aria-label="Videoyu kaldır"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={addHeroVideo}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              <Icon name="plus" className="h-4 w-4" />
              Video ekle
            </button>
            {heroVideos.length === 0 && (
              <p className="text-xs text-ink/40">Hiç eklenmezse mevcut varsayılan görsel kullanılır.</p>
            )}
            {heroVideos.length > 1 && (
              <p className="text-xs text-ink/40">
                Her video "tur sayısı" doluysa o kadar kez tam oynadıktan sonra, boşsa kendi
                "gösterim süresi" kadar ekranda kalıp (boşsa 15 sn) bir sonrakine geçilir; son
                videodan sonra başa döner.
              </p>
            )}

            <div className="grid gap-5 border-t border-ink/8 pt-5 sm:grid-cols-2">
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
            </div>
            <p className="text-xs text-ink/40">
              Tarayıcılar güvenlik gereği sesli otomatik oynatmaya genelde izin vermez — "Sessiz
              başlat" kapalıyken video otomatik oynasa da ilk kullanıcı etkileşimine kadar sessiz
              kalabilir.
            </p>
          </div>
        </Card>

        <Card title="Hero Alanı Boyutu">
          <div className="space-y-4 p-5">
            <p className="text-xs text-ink/50">
              Anasayfa giriş bölümünün (video/görselin oynadığı alan) dikey boyutu. Video daha
              küçük/dar hissettiriyorsa "Geniş" veya "Ekstra Geniş" seçin.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {HERO_SIZES.map((size) => {
                const active = heroSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setHeroSize(size)}
                    aria-current={active}
                    className={`flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-brand bg-brand/5"
                        : "border-ink/10 bg-white hover:border-brand/30"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${active ? "text-brand" : "text-ink"}`}>
                      {HERO_SIZE_LABELS[size]}
                    </span>
                    <span className="text-xs text-ink/45">{HERO_SIZE_DESCRIPTIONS[size]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card title="Sahadan Kareler (Gerçek İşler, Gerçek Mekânlar)">
          <div className="space-y-4 p-5">
            <p className="text-xs text-ink/50">
              Anasayfada hemen aşağıda görünen saha fotoğrafları galerisi. Hiç eklenmezse mevcut
              varsayılan 3 görsel kullanılmaya devam eder.
            </p>
            {galleryError && <ErrorBox message={galleryError} />}
            <div className="grid gap-3 sm:grid-cols-3">
              {galleryItems.map((item, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-ink/10 p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      isGalleryBlobUrl(item.imageUrl)
                        ? `/api/site-settings/gallery-image?url=${encodeURIComponent(item.imageUrl)}`
                        : item.imageUrl
                    }
                    alt=""
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                  <Input
                    value={item.caption}
                    onChange={(e) => updateGalleryItem(i, { caption: e.target.value })}
                    placeholder="Açıklama (örn. İş yeri kurulumu)"
                    maxLength={160}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(i)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-red-500/70 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
            {galleryItems.length < 12 && (
              <button
                type="button"
                disabled={galleryUploading}
                onClick={() => galleryFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline disabled:opacity-50"
              >
                <Icon name="plus" className="h-4 w-4" />
                {galleryUploading ? "Yükleniyor…" : "Görsel ekle"}
              </button>
            )}
            <input
              ref={galleryFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleGalleryFilePick}
            />
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
                {mapEmbedUrl.trim() && !isEmbeddableMapUrl(mapEmbedUrl.trim()) ? (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    Bu link gömülebilir (embed) türde değil — site bu linki kullanamaz ve otomatik
                    olarak adresten ürettiği bir haritaya düşer. "Paylaş" düğmesindeki kısa link
                    değil, aşağıdaki talimattaki "Haritayı yerleştir" sekmesindeki linki yapıştırın.
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-ink/40">
                    Google Haritalar&apos;da adresi arayın → Paylaş → <strong>Haritayı yerleştir</strong>{" "}
                    sekmesi → linki buraya yapıştırın (kısa paylaşım linki değil). Boş bırakırsanız
                    veya yanlış bir link girerseniz, harita yukarıdaki adresten otomatik üretilir.
                  </p>
                )}
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
              <Field label="YouTube kanalı linki">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@..."
                />
              </Field>
              <Field label="TikTok linki">
                <Input
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@..."
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
              <Field label="Yüzen WhatsApp butonu üzerindeki etiket (opsiyonel)">
                <Input
                  value={whatsappFloatLabel}
                  onChange={(e) => setWhatsappFloatLabel(e.target.value.slice(0, 60))}
                  placeholder="Örn. Ücretsiz Keşif"
                  maxLength={60}
                />
                <p className="mt-1.5 text-xs text-ink/40">
                  Boş bırakılırsa sağ altta sadece ikon görünür (mevcut hâli).
                </p>
              </Field>
            </div>
          </div>
        </Card>
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
