"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/icons";

/* ---------- Durum etiketleri ---------- */

export const REQUEST_STATUS_LABEL: Record<string, string> = {
  yeni: "Yeni",
  aranacak: "Aranacak",
  "randevu-verildi": "Randevu verildi",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

export const APPOINTMENT_STATUS_LABEL: Record<string, string> = {
  planlandi: "Planlandı",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

export const OFFER_STATUS_LABEL: Record<string, string> = {
  tasarim: "Taslak",
  gonderildi: "Gönderildi",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export const JOB_STATUS_LABEL: Record<string, string> = {
  planlandi: "Planlandı",
  "devam-ediyor": "Devam ediyor",
  tamamlandi: "Tamamlandı",
  garanti: "Garanti",
};

export const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  whatsapp: "WhatsApp",
  telefon: "Telefon",
  referans: "Referans",
  panel: "Panel",
};

export function statusTone(status: string) {
  switch (status) {
    case "yeni":
    case "planlandi":
    case "gonderildi":
      return "brand";
    case "aranacak":
    case "devam-ediyor":
      return "amber";
    case "tamamlandi":
    case "onaylandi":
      return "green";
    case "randevu-verildi":
    case "garanti":
      return "violet";
    case "iptal":
    case "reddedildi":
      return "red";
    default:
      return "gray";
  }
}

/* ---------- Temel bileşenler ---------- */

const tones = {
  brand: "bg-brand/10 text-brand",
  green: "bg-emerald-500/10 text-emerald-700",
  amber: "bg-amber-500/10 text-amber-700",
  red: "bg-red-500/10 text-red-600",
  violet: "bg-violet-500/10 text-violet-700",
  gray: "bg-ink/8 text-ink/55",
} as const;

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels: Record<string, string>;
}) {
  return <Badge tone={statusTone(status) as keyof typeof tones}>{labels[status] ?? status}</Badge>;
}

export function Btn({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "dark";
}) {
  const base = {
    primary:
      "bg-brand text-white hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed",
    ghost: "border border-ink/15 text-ink hover:border-ink/40 disabled:opacity-40",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-40",
    dark: "bg-ink text-white hover:bg-ink-soft disabled:opacity-40",
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${base} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className={`my-8 w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-4">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
      <p className="font-semibold text-ink/70">{title}</p>
      {desc && <p className="mt-1 text-sm text-ink/50">{desc}</p>}
    </div>
  );
}

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white shadow-sm">
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-3.5">
          {title && <h3 className="text-sm font-bold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      <div className="divide-y divide-ink/6">{children}</div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-ink/50">
      Yükleniyor…
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

export function fmtDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(dt: Date | string) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMoney(n: string | number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(n));
}