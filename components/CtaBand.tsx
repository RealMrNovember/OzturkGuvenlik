import Link from "next/link";
import { site, waLink } from "@/lib/site";
import { Icon } from "@/components/icons";

export function CtaBand({
  title = "Mekânınızı birlikte değerlendirelim.",
  subtitle = "Keşif ücretsizdir. Uzman ekibimiz ihtiyacınızı yerinde değerlendirir, size uygun çözümü belirler.",
  waText,
}: {
  title?: string;
  subtitle?: string;
  waText?: string;
}) {
  const wa = waText ? waLink(waText) : waLink(`Merhaba, ${site.name} web sitesinden ulaşıyorum. Keşif almak istiyorum.`);
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-ink-soft to-ink px-6 py-12 sm:px-12">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-3 text-white/70">{subtitle}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/kesif"
                className="flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-colors hover:bg-brand-light"
              >
                Ücretsiz Keşif Başlat
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-wa px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                WhatsApp'tan Yaz
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-white/50 lg:text-left">
            Telefonla hemen bilgi:{" "}
            <a href={site.phoneHref} className="font-semibold text-white/85">
              {site.phoneDisplay}
            </a>{" "}
            · Yenibosna / İstanbul
          </p>
        </div>
      </div>
    </section>
  );
}