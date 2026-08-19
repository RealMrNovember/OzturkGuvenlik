"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelRole } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { Btn, Card, ErrorBox, Field, Input, Loading } from "@/components/panel/ui";
import { DEFAULT_BRAND_COLOR, DEFAULT_BRAND_LIGHT_COLOR } from "@/lib/db/schema";

type SiteSettings = {
  id: number;
  brandColor: string;
  brandLightColor: string;
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
  const role = usePanelRole();
  const isAdmin = role === "admin";

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [brandColor, setBrandColor] = useState("#0e6fb8");
  const [brandLightColor, setBrandLightColor] = useState("#40a0e0");
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

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const data = await api<SiteSettings>("/api/site-settings", {
        method: "PATCH",
        body: JSON.stringify({ brandColor, brandLightColor }),
      });
      setSettings(data);
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

  const bothValid = HEX_REGEX.test(brandColor) && HEX_REGEX.test(brandLightColor);
  const dirty = settings
    ? brandColor !== settings.brandColor || brandLightColor !== settings.brandLightColor
    : false;
  const isDefault =
    brandColor.toLowerCase() === DEFAULT_BRAND_COLOR &&
    brandLightColor.toLowerCase() === DEFAULT_BRAND_LIGHT_COLOR;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-ink">
          <Icon name="palette" className="h-5 w-5 text-brand" />
          Site Ayarları
        </h1>
        <p className="mt-1 text-sm text-ink/55">
          Sitenin genel renk tonlarını buradan belirleyebilirsiniz. Değişiklikler hem
          web sitesine hem panele yansır.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <Card title="Tema Renkleri">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField
              label="Ana marka rengi"
              value={brandColor}
              placeholder="#0E6FB8"
              onChange={setBrandColor}
            />
            <ColorField
              label="Açık / vurgu rengi"
              value={brandLightColor}
              placeholder="#40A0E0"
              onChange={setBrandLightColor}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink/70">Önizleme</span>
            <div
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 p-5"
              style={{ background: bothValid ? brandColor : undefined }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md"
                style={{ background: bothValid ? brandLightColor : "#999" }}
              >
                Ücretsiz Keşif Başlat
              </span>
              <span className="text-sm font-medium text-white/90">
                Buton ve vurgu renkleri böyle görünecek
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-ink/8 pt-4">
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
      </Card>
    </div>
  );
}
