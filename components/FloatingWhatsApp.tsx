import { getResolvedSite, resolvedWaLinkDefault } from "@/lib/site-settings";
import { Icon } from "@/components/icons";

export async function FloatingWhatsApp() {
  const site = await getResolvedSite();
  const label = site.whatsappFloatLabel.trim();

  if (!label) {
    return (
      <a
        href={resolvedWaLinkDefault(site)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile yazın"
        className="fixed bottom-5 right-5 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-wa text-white shadow-xl shadow-wa/40 transition-transform hover:scale-105 lg:flex"
      >
        <Icon name="whatsapp" className="h-7 w-7" />
      </a>
    );
  }

  return (
    <a
      href={resolvedWaLinkDefault(site)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp ile yazın: ${label}`}
      className="fixed bottom-5 right-5 z-50 hidden items-center gap-3 rounded-full bg-wa py-1.5 pl-5 pr-1.5 text-white shadow-xl shadow-wa/40 transition-transform hover:scale-105 lg:flex"
    >
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Icon name="whatsapp" className="h-6 w-6" />
      </span>
    </a>
  );
}
