"use client";

import { useState } from "react";
import Link from "next/link";
import { services } from "@/lib/services";
import { site, waLink } from "@/lib/site";
import { Icon } from "@/components/icons";

const placeTypes = [
  { key: "İş yeri", desc: "Mağaza, ofis, klinik, restoran…" },
  { key: "Site / Apartman", desc: "Ortak alan ve giriş kontrolü" },
  { key: "Ev", desc: "Konut güvenliği" },
  { key: "Depo / Fabrika", desc: "Üretim ve depolama alanı" },
  { key: "Diğer", desc: "Yukarıdakilerden biri değil" },
];

const steps = [
  { n: 1, label: "Mekân" },
  { n: 2, label: "Sistemler" },
  { n: 3, label: "İletişim" },
];

export default function KesifPage() {
  const [step, setStep] = useState(1);
  const [place, setPlace] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const submit = async () => {
    setSending(true);
    setSaveError("");
    const payload = {
      name,
      phone,
      placeType: place ?? "",
      systems: selected,
      note,
      website, // honeypot: botlar doldurur, biz yok sayarız
    };
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      window.open(waLink(waMessage), "_blank", "noopener");
    } catch {
      setSaveError("Kayıt sırasında bir sorun oluştu. WhatsApp'tan devam edin.");
      window.open(waLink(waMessage), "_blank", "noopener");
    } finally {
      setSending(false);
    }
  };

  const toggle = (slug: string) =>
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    );

  const message = [
    "Merhaba, web sitesinden ücretsiz keşif talebi oluşturmak istiyorum.",
    "",
    `• Mekân: ${place ?? "—"}`,
    `• İlgilendiğim sistemler: ${
      selected.length
        ? selected
            .map((s) => services.find((sv) => sv.slug === s)?.name ?? s)
            .join(", ")
        : "Henüz emin değilim"
    }`,
    `• Adım: ${name || "—"}`,
    `• Telefon: ${phone || "—"}`,
  ];
  if (note.trim()) message.push(`• Not: ${note.trim()}`);
  message.push("", "Uygun bir zamanda beni arayabilir misiniz?");
  const waMessage = message.join("\n");

  const canNext =
    (step === 1 && place !== null) ||
    (step === 2 && selected.length > 0) ||
    step === 3;

  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">
            Ücretsiz keşif
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Keşif talebi oluşturun
          </h1>
          <p className="mt-3 text-ink/60">
            30 saniye sürer. Talep otomatik olarak kaydolur ve size en hızlı
            dönüşü yapalım.
          </p>
        </div>

        {/* progress */}
        <div className="mt-10 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step === s.n
                    ? "bg-brand text-white"
                    : step > s.n
                      ? "bg-brand/15 text-brand"
                      : "bg-ink/8 text-ink/40"
                }`}
              >
                {step > s.n ? "✓" : s.n}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={`h-1 flex-1 rounded-full ${
                    step > s.n ? "bg-brand/40" : "bg-ink/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-ink/50">
          Adım {step}/3 · {steps[step - 1].label}
        </p>

        <div className="mt-6 rounded-3xl border border-ink/8 bg-white p-6 shadow-sm sm:p-8">
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {placeTypes.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPlace(p.key)}
                  className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                    place === p.key
                      ? "border-brand bg-brand/5"
                      : "border-ink/8 hover:border-brand/40"
                  }`}
                >
                  <p className="font-semibold text-ink">{p.key}</p>
                  <p className="mt-1 text-xs text-ink/55">{p.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm text-ink/60">
                Bir veya birden fazla sistem seçin. Emin değilseniz yaklaşık
                ihtiyacınızı seçin; keşifte birlikte netleştiririz.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggle(s.slug)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                      selected.includes(s.slug)
                        ? "border-brand bg-brand/5"
                        : "border-ink/8 hover:border-brand/40"
                    }`}
                  >
                    <Icon
                      name={s.icon}
                      className={`h-5 w-5 shrink-0 ${
                        selected.includes(s.slug) ? "text-brand" : "text-ink/40"
                      }`}
                    />
                    <span className="text-sm font-semibold text-ink">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-ink">
                  Adınız
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız soyadınız"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-semibold text-ink">
                  Telefonunuz
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
                />
              </div>
              <div>
                <label htmlFor="note" className="text-sm font-semibold text-ink">
                  Not (isteğe bağlı)
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Örn: 3 katlı ofis, 6 kameraya ihtiyacımız var…"
                  className="mt-1.5 w-full resize-none rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
                />
              </div>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <p className="rounded-xl bg-surface px-4 py-3 text-xs text-ink/55">
                Bilgileriniz KVKK kapsamında yalnızca keşif iletişimi için kullanılır,
                üçüncü kişilerle paylaşılmaz.
              </p>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
              >
                Geri
              </button>
            ) : (
              <Link
                href="/hizmetler"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
              >
                Hizmetlere dön
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                Devam Et
              </button>
            ) : saved ? (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700">
                <Icon name="check" className="h-4 w-4" />
                Talebiniz kaydedildi
              </div>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-wa px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                {sending ? "Gönderiliyor…" : "Kaydet ve WhatsApp'ta Gönder"}
              </button>
            )}
          </div>

          {saveError && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {saveError}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink/50">
          Acele misiniz?{" "}
          <a href={site.phoneHref} className="font-semibold text-brand">
            {site.phoneDisplay}
          </a>{" "}
          numarasından hemen arayın.
        </p>
      </div>
    </section>
  );
}
