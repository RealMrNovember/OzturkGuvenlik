import Link from "next/link";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { Icon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-bold text-white">{site.name}</p>
            <p className="mt-3 text-sm leading-relaxed">
              2014'ten beri İstanbul'da güvenlik kamerası, alarm, yangın, PDKS ve
              erişim kontrol sistemleri kuruyoruz. Keşif ücretsizdir.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-brand hover:text-brand-light"
              >
                <Icon name="instagram" className="h-4 w-4" />
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-brand hover:text-brand-light"
              >
                <Icon name="facebook" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Hizmetler
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Kurumsal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/hizmetler" className="transition-colors hover:text-white">
                  Tüm Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="transition-colors hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/kesif" className="transition-colors hover:text-white">
                  Ücretsiz Keşif
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="transition-colors hover:text-white">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/40">
              İletişim
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
                <a href={site.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {site.address}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="phone" className="h-4 w-4 shrink-0 text-brand-light" />
                <a href={site.phoneHref} className="hover:text-white">
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="whatsapp" className="h-4 w-4 shrink-0 text-wa" />
                <span>7/24 WhatsApp hattı</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.
          </p>
          <p>
            Web tasarım & yazılım:{" "}
            <a
              href="https://cicibyte.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/60 transition-colors hover:text-white"
            >
              CiciByte Teknoloji
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
