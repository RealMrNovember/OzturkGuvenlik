"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";

export default function SifreSifirlaPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "İşlem başarısız");
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/panel/giris"), 2000);
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Öztürk Güvenlik" className="h-16 w-auto object-contain" />
          <h1 className="mt-4 text-xl font-bold text-white">Yeni Şifre Belirle</h1>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {done ? (
            <p className="text-center text-sm text-ink/70">
              Şifreniz güncellendi — giriş sayfasına yönlendiriliyorsunuz…
            </p>
          ) : (
            <form onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ink/70">Yeni şifre</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-brand"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-ink/70">Yeni şifre (tekrar)</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
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
                {loading ? "Kaydediliyor…" : "Şifreyi Güncelle"}
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
