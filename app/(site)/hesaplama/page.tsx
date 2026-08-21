"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { Icon } from "@/components/icons";
import { useSite } from "@/components/SiteContext";
import { resolvedWaLink } from "@/lib/site-resolve";
import {
  RESOLUTIONS,
  FPS_OPTIONS,
  CODECS,
  RETENTION_PRESETS,
  type CameraGroup,
  type CodecKey,
  type ResolutionKey,
  emptyGroup,
  calcGroup,
  suggestDisks,
} from "@/lib/hdd-calc";

function fmtGB(gb: number): string {
  if (gb >= 1024) return `${(gb / 1024).toFixed(gb / 1024 >= 10 ? 1 : 2)} TB`;
  return `${gb.toFixed(gb >= 10 ? 0 : 1)} GB`;
}

function GroupCard({
  group,
  index,
  onChange,
  onRemove,
  removable,
}: {
  group: CameraGroup;
  index: number;
  onChange: (patch: Partial<CameraGroup>) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <input
          value={group.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={`Kamera grubu ${index + 1} (örn: Dış cephe)`}
          className="w-full rounded-lg border-0 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/35"
        />
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Grubu kaldır"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink/55">
          Kamera adedi
          <input
            type="number"
            min={1}
            value={group.count}
            onChange={(e) => onChange({ count: Math.max(1, Number(e.target.value) || 1) })}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <label className="text-xs font-semibold text-ink/55">
          Çözünürlük
          <select
            value={group.resolution}
            onChange={(e) => onChange({ resolution: e.target.value as ResolutionKey })}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {RESOLUTIONS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-ink/55">
          FPS (saniyedeki kare)
          <select
            value={group.fps}
            onChange={(e) => onChange({ fps: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {FPS_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f} fps
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold text-ink/55">
          Sıkıştırma
          <select
            value={group.codec}
            onChange={(e) => onChange({ codec: e.target.value as CodecKey })}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          >
            {CODECS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ continuous: true })}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            group.continuous ? "bg-brand text-white" : "bg-surface text-ink/60 hover:bg-ink/8"
          }`}
        >
          Sürekli kayıt (7/24)
        </button>
        <button
          type="button"
          onClick={() => onChange({ continuous: false })}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            !group.continuous ? "bg-brand text-white" : "bg-surface text-ink/60 hover:bg-ink/8"
          }`}
        >
          Hareket algılama
        </button>
        {!group.continuous && (
          <label className="flex items-center gap-2 text-xs text-ink/60">
            Günde aktif saat:
            <input
              type="number"
              min={1}
              max={24}
              value={group.activeHoursPerDay}
              onChange={(e) =>
                onChange({ activeHoursPerDay: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })
              }
              className="w-16 rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-center text-ink outline-none focus:border-brand"
            />
          </label>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-xs font-medium text-ink/60">
          <input
            type="checkbox"
            checked={group.audio}
            onChange={(e) => onChange({ audio: e.target.checked })}
            className="h-3.5 w-3.5 accent-brand"
          />
          Ses kaydı
        </label>
      </div>
    </div>
  );
}

export default function HesaplamaPage() {
  const site = useSite();
  const [groups, setGroups] = useState<CameraGroup[]>([emptyGroup("g1")]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [customRetention, setCustomRetention] = useState("");
  const [raidMirror, setRaidMirror] = useState(false);

  const updateGroup = (id: string, patch: Partial<CameraGroup>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const addGroup = () => setGroups((gs) => [...gs, emptyGroup(`g${gs.length + 1}-${Date.now()}`)]);
  const removeGroup = (id: string) => setGroups((gs) => gs.filter((g) => g.id !== id));

  const results = useMemo(() => groups.map((g) => calcGroup(g, retentionDays)), [groups, retentionDays]);
  const totalCameras = groups.reduce((s, g) => s + g.count, 0);
  const totalGB = results.reduce((s, r) => s + r.totalGB, 0);
  const disk = useMemo(() => suggestDisks(totalGB, raidMirror), [totalGB, raidMirror]);

  const waMessage = [
    "Merhaba, web sitenizdeki HDD hesaplama aracını kullandım ve bir fiyat teklifi almak istiyorum.",
    "",
    `• Toplam kamera: ${totalCameras}`,
    `• Saklama süresi: ${retentionDays} gün`,
    `• Tahmini gereken kapasite: ${fmtGB(totalGB)}${raidMirror ? " (RAID 1 dahil)" : ""}`,
    `• Önerilen disk: ${disk.count} adet ${disk.sizeTb} TB`,
    "",
    "Uygun bir zamanda beni arayabilir misiniz?",
  ].join("\n");

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Ücretsiz araç"
          title="HDD / Disk Kapasitesi Hesaplama"
          subtitle="Kamera sayınıza, çözünürlüğünüze ve saklama süresine göre kayıt cihazınız için gereken disk kapasitesini saniyeler içinde hesaplayın."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-4">
            {groups.map((g, i) => (
              <GroupCard
                key={g.id}
                group={g}
                index={i}
                removable={groups.length > 1}
                onChange={(patch) => updateGroup(g.id, patch)}
                onRemove={() => removeGroup(g.id)}
              />
            ))}

            <button
              type="button"
              onClick={addGroup}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink/60 transition-colors hover:border-brand hover:text-brand"
            >
              <Icon name="plus" className="h-4 w-4" />
              Farklı çözünürlükte kamera grubu ekle
            </button>

            <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-ink">Saklama süresi</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {RETENTION_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setRetentionDays(d);
                      setCustomRetention("");
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      retentionDays === d && !customRetention
                        ? "bg-brand text-white"
                        : "bg-surface text-ink/60 hover:bg-ink/8"
                    }`}
                  >
                    {d} gün
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  placeholder="Özel (gün)"
                  value={customRetention}
                  onChange={(e) => {
                    setCustomRetention(e.target.value);
                    const n = Number(e.target.value);
                    if (n > 0) setRetentionDays(n);
                  }}
                  className="w-28 rounded-full border border-ink/15 bg-white px-4 py-2 text-xs text-ink outline-none focus:border-brand"
                />
              </div>

              <label className="mt-4 flex items-center gap-2 text-xs font-medium text-ink/60">
                <input
                  type="checkbox"
                  checked={raidMirror}
                  onChange={(e) => setRaidMirror(e.target.checked)}
                  className="h-3.5 w-3.5 accent-brand"
                />
                RAID 1 (aynalı) yedekleme kullanılacak — kapasite ihtiyacı 2 katına çıkar
              </label>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="accent-frame rounded-2xl bg-white p-6 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/45">Tahmini sonuç</p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-brand">{fmtGB(totalGB)}</p>
              <p className="mt-1 text-sm text-ink/55">
                {totalCameras} kamera · {retentionDays} gün saklama{raidMirror ? " · RAID 1" : ""}
              </p>

              <div className="mt-5 rounded-xl bg-surface p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/45">Önerilen disk</p>
                <p className="mt-1.5 flex items-center gap-2 text-lg font-bold text-ink">
                  <Icon name="hdd" className="h-5 w-5 text-brand" />
                  {disk.count} adet {disk.sizeTb} TB
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  Gerçek disk kapasiteleri üreticiye göre birkaç yüzde farklılık gösterebilir; bu nedenle
                  bir üst standart boyut öneriyoruz.
                </p>
              </div>

              {results.length > 0 && (
                <div className="mt-5 space-y-2 border-t border-ink/8 pt-4 text-xs text-ink/60">
                  {results.map((r, i) => (
                    <div key={r.group.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {r.group.label || `Grup ${i + 1}`} ({r.group.count} kam.)
                      </span>
                      <span className="shrink-0 font-semibold text-ink">{fmtGB(r.totalGB)}</span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href={resolvedWaLink(site, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-wa px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                Bu hesapla teklif al
              </a>
              <Link
                href="/kesif"
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/50"
              >
                Ücretsiz keşif talep et
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink/40">
          Bu araç, endüstride yaygın kullanılan referans bit hızı tablolarına dayanan bir tahmindir.
          Kesin ihtiyacınız kamera modeline, sahne karmaşıklığına ve gece görüş ayarlarına göre değişebilir
          — kesin rakam için{" "}
          <a href={site.phoneHref} className="font-semibold text-brand">
            {site.phoneDisplay}
          </a>{" "}
          numarasından bize ulaşabilirsiniz.
        </p>
      </div>
    </section>
  );
}
