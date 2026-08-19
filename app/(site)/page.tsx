import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { services, processSteps } from "@/lib/services";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { HeroMedia } from "@/components/HeroMedia";
import { SectionHeading } from "@/components/SectionHeading";
import { ReviewsSection } from "@/components/ReviewsSection";
import { BrandsShowcase } from "@/components/BrandsShowcase";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: `${site.name} | Güvenlik Kamerası, Alarm, PDKS — İstanbul`,
  description:
    "İstanbul genelinde güvenlik kamerası, hırsız ve yangın alarmı, PDKS, bariyer ve turnike sistemleri. Ücretsiz keşif: 0535 014 65 93. Yenibosna'dan tüm İstanbul'a hizmet.",
};

const trustChips = [
  { label: "11+ yıl deneyim", icon: "clock" as const },
  { label: "Google 5.0 puan", icon: "star" as const },
  { label: "33+ gerçek yorum", icon: "whatsapp" as const },
  { label: "Yenibosna · İstanbul geneli", icon: "pin" as const },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <HeroMedia />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
              {trustChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
                >
                  <Icon name={chip.icon} className="h-3.5 w-3.5 text-brand-light" />
                  {chip.label}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Güvenlik sistemlerinizi{" "}
              <span className="text-brand-light">birlikte planlayalım.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              2014'ten beri iş yeri, site ve evler için güvenlik kamerası, hırsız ve
              yangın alarmı, PDKS, bariyer ve turnike sistemleri kuruyoruz. Keşif
              ücretsiz, teklif şeffaf.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/kesif"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand/40 transition-colors hover:bg-brand-light"
              >
                Ücretsiz Keşif Başlat
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10"
              >
                <Icon name="phone" className="h-4 w-4 text-brand-light" />
                {site.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section id="hizmetler" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Hizmetlerimiz"
            title="Ne arıyorsunuz?"
            subtitle="İhtiyacınıza göre 11 farklı sistem. Hangi çözümün size uygun olduğundan emin değilseniz ücretsiz keşifle birlikte karar verelim."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 80}>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-ink/8 bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand shadow-sm transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/60">
                    {s.short}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    İncele
                    <Icon
                      name="arrow"
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Nasıl çalışıyoruz?"
            title="4 adımda kurulum"
            subtitle="İlk görüşmeden teslimata kadar süreç sizin için net."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-ink-soft p-6">
                  <span className="text-4xl font-black text-white/15">{step.n}</span>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <p className="mt-10 text-center text-sm text-white/60">
              Sözleşme, plan ve teslim tutanağıyla çalışırız —{" "}
              <Link href="/kesif" className="font-semibold text-brand-light underline-offset-4 hover:underline">
                ücretsiz keşif talebi oluşturun
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* REAL WORK */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Sahadan kareler"
            title="Gerçek işler, gerçek mekânlar"
            subtitle="Aşağıdaki görseller kurduğumuz sistemlerin saha fotoğraflarıdır."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                src: "/images/is-1.jpg",
                alt: "Kurulan güvenlik kamerası sistemi",
                caption: "İş yeri güvenlik kamerası kurulumu",
              },
              {
                src: "/images/hero-1.jpg",
                alt: "Kamera sistemi kurulum çalışması",
                caption: "Saha keşif ve montaj çalışması",
              },
              {
                src: "/images/is-2.jpg",
                alt: "Kurulumu yapılmış güvenlik sistemi",
                caption: "Kurulum sonrası sistem görünümü",
              },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 90}>
                <figure className="accent-frame group overflow-hidden rounded-2xl bg-ink shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={2000}
                    height={1500}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <figcaption className="bg-white px-5 py-4 text-sm font-semibold text-ink">
                    {img.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* BRANDS */}
      <BrandsShowcase />

      {/* MAP + CONTACT */}
      <section id="adres" className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand">
                Bize ulaşın
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Keşif ücretsiz, telefon 7/24 açık.
              </h2>
              <p className="mt-4 text-ink/60">
                Bizi arayın ya da WhatsApp'tan yazın; aynı gün dönüş yapalım.
              </p>
              <ul className="mt-8 space-y-5 text-ink">
                <li className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                    <Icon name="pin" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Adres</p>
                    <a href={site.mapLink} target="_blank" rel="noopener noreferrer" className="text-sm text-ink/70 hover:text-brand">
                      {site.address}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                    <Icon name="phone" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Telefon / WhatsApp</p>
                    <a href={site.phoneHref} className="text-sm text-ink/70 hover:text-brand">
                      {site.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                    <Icon name="clock" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Çalışma saatleri</p>
                    <p className="text-sm text-ink/70">Hafta içi 09:00 – 19:00 · Cumartesi 10:00 – 16:00</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  Hemen Arayın
                </a>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  İletişim Sayfası
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="overflow-hidden rounded-3xl border border-ink/8 shadow-sm">
              <iframe
                src={site.mapEmbedUrl}
                title="Öztürk Güvenlik Sistemleri harita konumu"
                className="h-[360px] w-full border-0 lg:h-[440px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
