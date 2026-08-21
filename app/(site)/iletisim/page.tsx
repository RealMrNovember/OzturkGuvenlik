import type { Metadata } from "next";
import { getResolvedSite, resolvedWaLinkDefault } from "@/lib/site-settings";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getResolvedSite();
  return {
    title: "İletişim",
    description: `${site.name} iletişim bilgileri: ${site.phoneDisplay}, WhatsApp, Yenibosna / İstanbul adres ve çalışma saatleri.`,
  };
}

export default async function ContactPage() {
  const site = await getResolvedSite();

  const cards = [
    ...(site.phones.length > 1
      ? []
      : [
          {
            title: "Telefon",
            desc: site.phoneDisplay,
            sub: "Pzt–Cmt 09:00 – 19:00",
            href: site.phoneHref,
            icon: "phone" as const,
          },
        ]),
    {
      title: "WhatsApp",
      desc: "7/24 mesaj alıyoruz",
      sub: "Fotoğraf atın, hızlı fiyat alın",
      href: resolvedWaLinkDefault(site),
      icon: "whatsapp" as const,
      external: true,
    },
    {
      title: "Adres",
      desc: site.address,
      sub: "Yol tarifi için tıklayın",
      href: site.mapLink,
      icon: "pin" as const,
      external: true,
    },
  ];

  return (
    <>
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-light">
              İletişim
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Bize ulaşın, aynı gün dönüş yapalım.
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              Soru, fiyat teklifi ya da servis talebi — fark etmez. En hızlı yol
              telefon ve WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          {site.phones.length > 1 ? (
            <div className="mb-5 grid gap-5 sm:grid-cols-3">
              {site.phones.map((p, i) => (
                <Reveal key={i} delay={i * 60}>
                  <a
                    href={`tel:${p.number.replace(/\D/g, "")}`}
                    className="flex h-full items-center gap-3 rounded-2xl border border-ink/8 bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                      <Icon name="phone" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      {p.label && <p className="text-xs font-semibold text-ink/50">{p.label}</p>}
                      <p className="font-bold text-ink">{p.number}</p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-3">
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="flex h-full flex-col rounded-2xl border border-ink/8 bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                    <Icon name={c.icon} className="h-6 w-6" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-ink">{c.title}</h2>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-ink/70">
                    {c.desc}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-brand">{c.sub}</p>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className="mt-10 overflow-hidden rounded-3xl border border-ink/8 shadow-sm">
              <iframe
                src={site.mapEmbedUrl}
                title="Öztürk Güvenlik Sistemleri harita konumu"
                className="h-[420px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl bg-ink p-8 text-white sm:flex-row sm:p-10">
              <div>
                <p className="text-lg font-bold">Sosyal medya</p>
                <p className="mt-1 text-sm text-white/60">
                  Güncel işlerimizi Instagram'dan takip edin.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-ink"
                >
                  <Icon name="instagram" className="h-4 w-4" />
                  Instagram
                </a>
                <a
                  href={site.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-ink"
                >
                  <Icon name="facebook" className="h-4 w-4" />
                  Facebook
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Keşif talebiniz mi var?"
        subtitle="Formu doldurmakla uğraşmayın — tek mesaj yetiyor."
      />
    </>
  );
}
