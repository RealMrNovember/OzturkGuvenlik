"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { Icon } from "@/components/icons";
import { services } from "@/lib/services";
import { extractYouTubeId, youtubeThumbnailUrl } from "@/lib/youtube";
import { Badge, Btn, ErrorBox, Field, Input, Loading, Modal } from "@/components/panel/ui";

type ServiceMediaRow = {
  serviceSlug: string;
  videoUrl: string | null;
  videoAutoplay: boolean;
  videoMuted: boolean;
  videoStart: number;
  videoDuration: number | null;
};

export default function HizmetMedyaPage() {
  const [rows, setRows] = useState<ServiceMediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [autoplay, setAutoplay] = useState(true);
  const [muted, setMuted] = useState(true);
  const [start, setStart] = useState("0");
  const [duration, setDuration] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api<ServiceMediaRow[]>("/api/service-media");
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const mediaMap = new Map(rows.map((r) => [r.serviceSlug, r]));

  const openEdit = (slug: string) => {
    const row = mediaMap.get(slug);
    setVideoUrl(row?.videoUrl ?? "");
    setAutoplay(row?.videoAutoplay ?? true);
    setMuted(row?.videoMuted ?? true);
    setStart(String(row?.videoStart ?? 0));
    setDuration(row?.videoDuration ? String(row.videoDuration) : "");
    setError("");
    setEditingSlug(slug);
  };

  const videoId = extractYouTubeId(videoUrl);
  const videoUrlValid = videoUrl.trim() === "" || videoId !== null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoUrlValid || !editingSlug) return;
    setSaving(true);
    setError("");
    try {
      await api(`/api/service-media/${editingSlug}`, {
        method: "PATCH",
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          videoAutoplay: autoplay,
          videoMuted: muted,
          videoStart: Number(start) || 0,
          videoDuration: duration ? Number(duration) : null,
        }),
      });
      setEditingSlug(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Hizmet Videoları</h1>
        <p className="mt-1 text-sm text-ink/55">
          Her hizmetin detay sayfasında, başlığın arkasındaki koyu alanda oynatılacak YouTube
          videosunu buradan yönetin.
        </p>
      </div>

      {error && !editingSlug && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="divide-y divide-ink/6">
            {services.map((s) => {
              const row = mediaMap.get(s.slug);
              const hasVideo = Boolean(row?.videoUrl);
              return (
                <div key={s.slug} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand">
                      <Icon name={s.icon} className="h-4 w-4" />
                    </span>
                    <p className="truncate text-sm font-semibold text-ink">{s.name}</p>
                    <Badge tone={hasVideo ? "green" : "gray"}>{hasVideo ? "Video var" : "Video yok"}</Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(s.slug)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                    aria-label="Düzenle"
                  >
                    <Icon name="pen" className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingSlug && (
        <Modal
          open
          onClose={() => setEditingSlug(null)}
          title={`${services.find((s) => s.slug === editingSlug)?.name ?? ""} — Video`}
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <p className="text-xs text-ink/50">
              Link boş bırakılırsa bu hizmetin sayfası mevcut düz koyu arka planı kullanmaya devam
              eder.
            </p>
            <Field label="YouTube linki">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {!videoUrlValid && (
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
                <p className="text-xs font-medium text-ink/60">Video algılandı, sayfada oynatılacak.</p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Otomatik oynat
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <input
                  type="checkbox"
                  checked={muted}
                  onChange={(e) => setMuted(e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Sessiz başlat
              </label>
              <Field label="Başlangıç saniyesi">
                <Input type="number" min="0" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Süre (saniye, boşsa videonun tamamı)">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Örn. 12"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setEditingSlug(null)}>
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving || !videoUrlValid}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
