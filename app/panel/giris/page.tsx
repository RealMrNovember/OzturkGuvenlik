"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export default function PanelGirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Giriş başarısız");
        setLoading(false);
        return;
      }
      router.push("/panel");
      router.refresh();
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
          <img
            src="/images/logo.png"
            alt="Öztürk Güvenlik"
            className="h-16 w-auto object-contain"
          />
          <h1 className="mt-4 text-xl font-bold text-white">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-white/50">
            Öztürk Güvenlik Sistemleri
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink/70">
              E-posta
            </span>
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
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-ink/70">
              Şifre
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-brand"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
            {!loading && <Icon name="arrow" className="h-4 w-4" />}
          </button>

          <Link
            href="/"
            className="mt-4 block text-center text-xs font-semibold text-ink/50 hover:text-brand"
          >
            ← Siteye dön
          </Link>
        </form>
      </div>
    </div>
  );
}