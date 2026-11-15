"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Btn } from "@/components/panel/ui";

/**
 * Anasayfa "Ne arıyorsunuz?" kartının kapak görseli — yükleme/kaldırma
 * ProductImageUpload ile aynı desen (bkz. app/api/service-media/[slug]/
 * card-image/route.ts). Görsel, herkese açık proxy route üzerinden gösterilir
 * (private Blob olduğu için çıplak URL tarayıcıda 403 verir).
 */
export function ServiceCardImageUpload({
  slug,
  imageUrl,
  onChange,
}: {
  slug: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const displaySrc = imageUrl
    ? `/api/public/service-cards/${slug}/image?v=${encodeURIComponent(imageUrl.split("/").pop() ?? "")}`
    : null;

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/service-media/${slug}/card-image`, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız");
      onChange(json.data.cardImageUrl as string);
    } catch (err) {
      setError((err as Error).message || "Yükleme başarısız");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Kart görseli kaldırılsın mı? (İkonlu eski görünüme döner)")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/service-media/${slug}/card-image`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Kaldırma başarısız");
      onChange(null);
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
    <div className="space-y-2.5">
      <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-surface sm:w-56">
        {displaySrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displaySrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name="box" className="h-8 w-8 text-ink/20" />
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Btn type="button" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
          <Icon name="download" className="h-4 w-4 rotate-180" />
          {busy ? "Yükleniyor…" : imageUrl ? "Görseli değiştir" : "Görsel yükle"}
        </Btn>
        {imageUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-red-500/70 hover:bg-red-50 hover:text-red-600"
          >
            <Icon name="trash" className="h-4 w-4" />
            Kaldır
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />
    </div>
  );
}
