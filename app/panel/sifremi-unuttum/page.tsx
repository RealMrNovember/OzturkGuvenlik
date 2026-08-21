"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "İstek başarısız");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Sunucuya ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Öztürk Güvenlik" className="h-16 w-auto object-contain" />
          <h1 className="mt-4 text-xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="mt-1 text-sm text-white/50">Kayıtlı e-postanıza sıfırlama bağlantısı gönderelim</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-ink/70">
                Eğer bu e-posta sistemde kayıtlıysa, 1 saat geçerli bir sıfırlama bağlantısı gönderildi.
                Gelen kutunuzu (ve spam klasörünü) kontrol edin.
              </p>
              <Link href="/panel/giris" className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">
                ← Girişe dön
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ink/70">E-posta</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@ozturkguvenlik.com"
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-brand"
                />
              </label>

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:opacity-50"
              >
                {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
                {!loading && <Icon name="arrow" className="h-4 w-4" />}
              </button>

              <Link href="/panel/giris" className="mt-4 block text-center text-xs font-semibold text-ink/50 hover:text-brand">
                ← Girişe dön
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
