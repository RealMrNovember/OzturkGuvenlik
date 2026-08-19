import { waLinkDefault } from "@/lib/site";
import { Icon } from "@/components/icons";

export function FloatingWhatsApp() {
  return (
    <a
      href={waLinkDefault()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile yazın"
      className="fixed bottom-5 right-5 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-wa text-white shadow-xl shadow-wa/40 transition-transform hover:scale-105 lg:flex"
    >
      <Icon name="whatsapp" className="h-7 w-7" />
    </a>
  );
}