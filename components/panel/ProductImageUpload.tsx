"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Btn } from "@/components/panel/ui";

/**
 * Ürün görseli ekleme/değiştirme/kaldırma — alış fiyatının aksine gizlilik
 * gerektirmez, bu yüzden manage_products/view_costs izni aranmaz; oturum
 * açık olan herkes (admin ya da personel) kullanabilir (bkz. kullanıcı isteği
 * ve app/api/products/[id]/image/route.ts).
 */
export function ProductImageUpload({
  productId,
  imageUrl,
  onChange,
  size = "sm",
}: {
  productId: number;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  size?: "sm" | "lg";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/products/${productId}/image`, { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız");
      onChange(json.data.imageUrl as string);
    } catch (err) {
      setError((err as Error).message || "Yükleme başarısız");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Görsel kaldırılsın mı?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/image`, { method: "DELETE" });
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

  const hiddenInputs = (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePick} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />
    </>
  );

  if (size === "lg") {
    return (
      <div className="space-y-2.5">
        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-ink/10 bg-surface">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Ürün görseli" className="h-full w-full object-cover" />
          ) : (
            <Icon name="box" className="h-10 w-10 text-ink/20" />
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Btn type="button" variant="ghost" disabled={busy} onClick={() => cameraRef.current?.click()}>
            <Icon name="camera" className="h-4 w-4" />
            {busy ? "Yükleniyor…" : "Kamerayla Çek"}
          </Btn>
          <Btn type="button" variant="ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Icon name="download" className="h-4 w-4 rotate-180" />
            Dosya Yükle
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
        {hiddenInputs}
      </div>
    );
  }

  return (
    <div className="group relative h-11 w-11 shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        aria-label={imageUrl ? "Görseli değiştir" : "Görsel ekle"}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-surface"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name="box" className="h-5 w-5 text-ink/20" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Icon name="camera" className="h-4 w-4 text-white" />
        </span>
      </button>
      {hiddenInputs}
      {error && <p className="absolute left-0 top-full z-10 w-32 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
