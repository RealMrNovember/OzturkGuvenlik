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
        }),
      });
      setSettings(data);
      setAccentThickness(String(data.accentThickness));
      setHeroVideoStart(String(data.heroVideoStart));
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
      durationNum !== settings.heroVideoDuration
    : false;
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
          Sitenin genel renk tonlarını, vurgu çerçeve efektini ve hero videosunu buradan
          belirleyebilirsiniz. Değişiklikler hem web sitesine hem panele yansır.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <form onSubmit={save} className="space-y-5">
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

        <div className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <Btn type="submit" disabled={saving || !bothValid || !dirty}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Btn>
          <Btn variant="ghost" type="button" onClick={resetToDefault} disabled={saving || isDefault}>
            <Icon name="refresh" className="h-3.5 w-3.5" />
            Varsayılana Sıfırla
          </Btn>
          {saved && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <Icon name="check" className="h-4 w-4" />
              Kaydedildi
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
