"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import type { PhotoRef } from "@/lib/db/schema";

/** İş/servis kaydına birden çok fotoğraf ekleme/kaldırma — ürün görseliyle
 * aynı private-blob+proxy deseni (bkz. app/api/jobs/[id]/photos). basePath
 * örn. "/api/jobs/12" ya da "/api/service-tickets/7". */
export function PhotoGallery({
  basePath,
  photos,
  onChange,
}: {
  basePath: string;
  photos: PhotoRef[];
  onChange: (photos: PhotoRef[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${basePath}/photos`, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız");
      onChange([...photos, { id: json.data.id as string, url: "" }]);
    } catch (err) {
      setError((err as Error).message || "Yükleme başarısız");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (photoId: string) => {
    if (!confirm("Fotoğraf kaldırılsın mı?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/photos?photoId=${photoId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Kaldırma başarısız");
      onChange(photos.filter((p) => p.id !== photoId));
    } catch (err) {
      setError((err as Error).message || "Kaldırma başarısız");
    } finally {
      setBusy(false);
    }
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) upload(file);
  };

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/45">
        Fotoğraflar {photos.length > 0 && `(${photos.length})`}
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.id} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}/photos/${p.id}`} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(p.id)}
              aria-label="Fotoğrafı kaldır"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Icon name="close" className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/20 text-ink/40 hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <Icon name="camera" className="h-5 w-5" />
          <span className="text-[10px] font-semibold">{busy ? "…" : "Ekle"}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />
      </div>
    </div>
  );
}
