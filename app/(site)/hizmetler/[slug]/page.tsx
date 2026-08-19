import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getService } from "@/lib/services";
import { site, waLink } from "@/lib/site";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.tagline} İstanbul geneli ücretsiz keşif: ${site.phoneDisplay}.`,
    alternates: { canonical: `/hizmetler/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const jsonLd = {
    "@graph": [
      breadcrumbJsonLd([
        { name: "Ana Sayfa", path: "/" },
        { name: "Hizmetler", path: "/hizmetler" },
        { name: service.name, path: `/hizmetler/${service.slug}` },
      ]),
      serviceJsonLd(service),
    ],
  };

  const waText = waLink(service.waText);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <nav aria-label="breadcrumb" className="text-xs text-white/50">
              <Link href="/" className="hover:text-white">Ana Sayfa</Link>
              <span className="mx-2">/</span>
              <Link href="/hizmetler" className="hover:text-white">Hizmetler</Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">{service.name}</span>
            </nav>
            <div className="mt-8 flex items-start gap-5">
              <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-light sm:flex">
                <Icon name={service.icon} className="h-8 w-8" />
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {service.name}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-white/70">{service.tagline}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  {service.name} hakkında
                </h2>
              </Reveal>
              {service.intro.map((p, i) => (
                <Reveal key={i} delay={i * 60}>
                  <p className="leading-relaxed text-ink/70">{p}</p>
                </Reveal>
              ))}

              <Reveal>
                <h2 className="pt-4 text-2xl font-bold tracking-tight text-ink">
                  Kimler için uygun?
                </h2>
              </Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.forWho.map((item, i) => (
                  <Reveal key={item.title} delay={i * 60}>
                    <div className="rounded-2xl border border-ink/8 bg-surface p-5">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* SIDE CTA */}
            <aside>
              <Reveal delay={120}>
                <div className="sticky top-24 space-y-4 rounded-3xl border border-ink/8 bg-surface p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-ink">Bu sisteme mi ihtiyacınız var?</h3>
                  <p className="text-sm text-ink/60">
                    Fiyat ve kurulum detayları için bize ulaşın. Keşif ücretsizdir.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <a
                      href={waText}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full bg-wa px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
                    >
                      <Icon name="whatsapp" className="h-4 w-4" />
                      WhatsApp'tan Sor
                    </a>
                    <a
                      href={site.phoneHref}
                      className="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
                    >
                      <Icon name="phone" className="h-4 w-4" />
                      {site.phoneDisplay}
                    </a>
                  </div>
                  <p className="text-center text-xs text-ink/50">
                    Pazartesi – Cumartesi 09:00 – 19:00
                  </p>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {/* SYSTEMS */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sunduğumuz {service.name} çözümleri
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {service.systems.map((sys, i) => (
              <Reveal key={sys.title} delay={i * 60}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Icon name="check" className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{sys.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/60">{sys.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h2 className="mt-16 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Neler dahil?
            </h2>
          </Reveal>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {service.features.map((f, i) => (
              <Reveal key={f} delay={i * 40}>
                <li className="flex items-start gap-3 rounded-xl bg-white p-4 text-sm text-ink/75 shadow-sm">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {f}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Sık sorulan sorular
            </h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {service.faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 50}>
                <details className="group rounded-2xl border border-ink/8 bg-surface p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                    {faq.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform group-open:rotate-180">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={`${service.name} için hemen bilgi alın.`}
        subtitle="Keşif ücretsizdir; yerinde değerlendirme ile en doğru çözümü sunarız."
        waText={service.waText}
      />
    </>
  );
}
