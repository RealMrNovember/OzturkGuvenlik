import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Güvenlik kamerası, hırsız alarmı, yangın alarmı, PDKS, bariyer ve turnike, ses ve anons, network ve akıllı ev sistemleri. Ücretsiz keşif için arayın.",
  alternates: { canonical: "/hizmetler" },
};

const groups: { key: "kamera" | "alarm" | "gecis" | "diger"; title: string; desc: string }[] = [
  {
    key: "kamera",
    title: "Kamera Sistemleri",
    desc: "İzleme, kayıt ve mobil erişim çözümleri.",
  },
  {
    key: "alarm",
    title: "Alarm Sistemleri",
    desc: "Hırsız ve yangın koruması.",
  },
  {
    key: "gecis",
    title: "Geçiş Kontrolü",
    desc: "Kim girer, kim çıkar — tam kontrol.",
  },
  {
    key: "diger",
    title: "Diğer Sistemler",
    desc: "Ses, network ve akıllı ev çözümleri.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-light">
              Hizmetlerimiz
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Mekânınız için doğru sistemi kuruyoruz.
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Her ihtiyaç farklıdır: hangi sistem size uygun emin değilseniz ücretsiz
              keşifte birlikte karar verelim.
            </p>
          </Reveal>
        </div>
      </section>

      {groups.map((group, gi) => {
        const items = services.filter((s) => s.group === group.key);
        if (items.length === 0) return null;
        return (
          <section key={group.key} className={gi % 2 === 0 ? "bg-white" : "bg-surface"}>
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
              <SectionHeading
                align="left"
                eyebrow={group.title}
                title={group.desc}
              />
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {items.map((s, i) => (
                  <Reveal key={s.slug} delay={i * 70}>
                    <Link
                      href={`/hizmetler/${s.slug}`}
                      className="group flex items-start gap-5 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                        <Icon name={s.icon} className="h-6 w-6" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-ink">{s.name}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                          {s.short}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                          Detayları incele
                          <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CtaBand
        title="Hangi sistem gerekiyor, birlikte karar verelim."
        subtitle="Keşif ücretsizdir; yerinde değerlendirme ile en doğru çözümü sunarız."
      />
    </>
  );
}
