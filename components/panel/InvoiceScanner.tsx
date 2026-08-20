"use client";

import { useRef, useState } from "react";
import { extractInvoiceData, flattenWords, type ExtractedInvoice } from "@/lib/invoice-ocr";
import { Btn, ErrorBox, Modal } from "@/components/panel/ui";
import { Icon } from "@/components/icons";

type SupplierOption = { id: number; name: string };
type ProductOption = { id: number; name: string };

async function fileToOcrInput(file: File): Promise<HTMLCanvasElement | File> {
  if (file.type !== "application/pdf") return file;

  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PDF önizlemesi oluşturulamadı");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

export function InvoiceScanner({
  open,
  onClose,
  suppliers,
  products,
  onExtracted,
}: {
  open: boolean;
  onClose: () => void;
  suppliers: SupplierOption[];
  products: ProductOption[];
  onExtracted: (result: ExtractedInvoice, scannedFileUrl: string, previewUrl: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "ocr" | "uploading">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError("");
    setStatus("ocr");
    setProgress(0);
    const previewUrl = URL.createObjectURL(file);
    try {
      const ocrInput = await fileToOcrInput(file);

      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("tur", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(ocrInput);
      await worker.terminate();

      const words = flattenWords(data);
      const extracted = extractInvoiceData(data.text, words, suppliers, products);

      setStatus("uploading");
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/suppliers/scan-upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Yükleme başarısız");

      onExtracted(extracted, json.data.url as string, previewUrl);
      setStatus("idle");
    } catch (err) {
      setError((err as Error).message || "Tarama başarısız oldu — kalemleri elle girebilirsiniz.");
      setStatus("idle");
    }
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) processFile(file);
  };

  if (!open) return null;

  return (
    <Modal open onClose={status === "idle" ? onClose : () => {}} title="Fatura/Proforma/Makbuz Tara">
      <div className="space-y-4">
        {error && <ErrorBox message={error} />}

        {status === "idle" ? (
          <>
            <p className="text-sm text-ink/60">
              Kamerayla fotoğrafını çekin ya da bir dosya (JPG/PNG/PDF) yükleyin — sistem tedarikçiyi,
              kalemleri ve toplamı otomatik tahmin edip formu önceden doldurur. Hiçbir şey kaydedilmeden
              önce her alanı kontrol edip düzeltebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn type="button" onClick={() => cameraInputRef.current?.click()}>
                <Icon name="camera" className="h-4 w-4" />
                Kamerayla Tara
              </Btn>
              <Btn type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                <Icon name="download" className="h-4 w-4 rotate-180" />
                Dosya Yükle
              </Btn>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePick}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handlePick}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="text-sm font-semibold text-ink/70">
              {status === "ocr" ? `Belge okunuyor… %${progress}` : "Belge yükleniyor…"}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
