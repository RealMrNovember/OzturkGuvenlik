import { getResolvedSite, resolvedWaLinkDefault } from "@/lib/site-settings";
import { Icon } from "@/components/icons";

export async function MobileBar() {
  const site = await getResolvedSite();
  return (
    <>
      <div className="h-[60px] lg:hidden" aria-hidden="true" />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/97 backdrop-blur-md lg:hidden"
        aria-label="Hızlı iletişim"
      >
        <div className="grid grid-cols-3 divide-x divide-white/10">
          <a
            href={site.phoneHref}
            className="flex flex-col items-center gap-1 py-2.5 text-white/90 active:bg-white/5"
          >
            <Icon name="phone" className="h-5 w-5 text-brand-light" />
            <span className="text-[11px] font-semibold">Hemen Ara</span>
          </a>
          <a
            href={resolvedWaLinkDefault(site)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 text-white/90 active:bg-white/5"
          >
            <Icon name="whatsapp" className="h-5 w-5 text-wa" />
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </a>
          <a
            href={site.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 text-white/90 active:bg-white/5"
          >
            <Icon name="map" className="h-5 w-5 text-white/70" />
            <span className="text-[11px] font-semibold">Yol Tarifi</span>
          </a>
        </div>
      </nav>
    </>
  );
}
