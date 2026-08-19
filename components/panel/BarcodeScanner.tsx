"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, Btn, ErrorBox } from "@/components/panel/ui";

let idCounter = 0;

/**
 * Kamera üzerinden barkod/QR tarama modalı. `html5-qrcode` tarayıcı-yalnızca
 * bir kütüphane olduğu için dinamik olarak (`import()`) içeride yüklenir —
 * sunucu tarafında hiç çalışmaz.
 *
 * `continuous`: kapanmadan art arda birden fazla tarama yapılmasını sağlar
 * (örn. bir kutu kamera için 6 seri numarasını peş peşe okutmak). Aynı kodun
 * kamera hâlâ üzerindeyken tekrar tekrar tetiklenmesini önlemek için 2
 * saniyelik basit bir tekrar filtresi var.
 */
export function BarcodeScannerModal({
  open,
  onClose,
  onScan,
  title = "Barkod Tara",
  continuous = false,
}: {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  continuous?: boolean;
}) {
  const [elementId] = useState(() => `barcode-scanner-${++idCounter}`);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState("");

  // Prop değişikliğine göre render sırasında state ayarlama (React'ın
  // önerdiği "adjusting state when a prop changes" deseni) — modal her
  // açıldığında önceki hatayı temizler, efekt içinde setState çağırmaz.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setError("");
  }

  // Callback'ler her render'da yeniden oluşabilir; kamera başlatma efektinin
  // yalnızca `open` değişince yeniden çalışması için en güncel değerler
  // ayrı bir efektte ref'e yazılıyor (render sırasında değil).
  const onScanRef = useRef(onScan);
  const continuousRef = useRef(continuous);
  useEffect(() => {
    onScanRef.current = onScan;
    continuousRef.current = continuous;
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const lastScan = { code: "", at: 0 };

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText) => {
            const now = Date.now();
            if (lastScan.code === decodedText && now - lastScan.at < 2000) return;
            lastScan.code = decodedText;
            lastScan.at = now;
            onScanRef.current(decodedText);
            if (!continuousRef.current) {
              scanner
                .stop()
                .then(() => scanner.clear())
                .catch(() => {});
            }
          },
          () => {
            /* karede kod bulunamadı — normal, sessizce geç */
          }
        )
        .catch(() => setError("Kameraya erişilemedi. Tarayıcı izinlerini kontrol edin."));
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner && scanner.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [open, elementId]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-3">
        {error && <ErrorBox message={error} />}
        <div id={elementId} className="overflow-hidden rounded-xl bg-ink" />
        <p className="text-center text-xs text-ink/45">
          {continuous
            ? "Barkodu kameraya gösterin — art arda okutabilirsiniz"
            : "Barkodu kameraya gösterin"}
        </p>
        <Btn variant="ghost" onClick={onClose} className="w-full justify-center">
          Kapat
        </Btn>
      </div>
    </Modal>
  );
}
