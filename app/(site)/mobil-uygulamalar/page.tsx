import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Icon } from "@/components/icons";
import { getResolvedSite } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Mobil Uygulamalar",
  description:
    "Kurduğumuz kamera ve alarm sistemlerini telefonunuzdan ve bilgisayarınızdan canlı izlemek için kullanacağınız marka uygulamaları ve indirme bağlantıları.",
  alternates: { canonical: "/mobil-uygulamalar" },
};

type App = {
  brand: string;
  logo?: string;
  app: string;
  note: string;
  /** false ise App Store/Google Play butonları gösterilmez (yalnızca masaüstü yazılımı). Varsayılan true. */
  mobile?: boolean;
  /** Doluysa "Bilgisayara İndir" butonu, resmi üretici indirme sayfasına yönlenir. */
  desktop?: { url: string };
};

const APPS: App[] = [
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "Hik-Connect",
    note: "IP kamera ve NVR/DVR cihazlarınızı canlı izleyin, kayıtlara erişin, bildirim alın.",
  },
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "iVMS-4500",
    note: "Eski nesil Hikvision NVR/DVR cihazları için mobil izleme uygulaması.",
  },
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "iVMS-4200",
    note: "Hikvision NVR/DVR ve IP kameralarınızı bilgisayardan çoklu ekranla izlemek ve kayıt oynatmak için masaüstü yönetim yazılımı.",
    mobile: false,
    desktop: { url: "https://www.hikvision.com/us-en/support/download/software/ivms4200-series/" },
  },
  {
    brand: "Dahua",
    logo: "/images/brands/dahua.png",
    app: "gDMSS Plus",
    note: "Dahua kamera ve kayıt cihazları için canlı izleme ve bildirim uygulaması.",
  },
  {
    brand: "Dahua",
    logo: "/images/brands/dahua.png",
    app: "SmartPSS",
    note: "Dahua NVR/DVR sistemlerini bilgisayardan merkezi olarak yönetmek ve çoklu kamera izlemek için masaüstü yazılımı.",
    mobile: false,
    desktop: { url: "https://us.dahuasecurity.com/product/smartpss/index.html" },
  },
  {
    brand: "EZVIZ",
    logo: "/images/brands/ezviz.png",
    app: "EZVIZ",
    note: "EZVIZ kameralarınızı tek uygulamadan yönetin, hareket bildirimlerini anında alın.",
  },
  {
    brand: "EZVIZ",
    logo: "/images/brands/ezviz.png",
    app: "EZVIZ Studio",
    note: "EZVIZ kameralarınızı büyük ekranda, bilgisayardan canlı izlemek ve kayıt almak için masaüstü yazılımı.",
    mobile: false,
    desktop: { url: "https://support.ezviz.com/download" },
  },
  {
    brand: "UNV",
    logo: "/images/brands/unv.png",
    app: "EZView",
    note: "Uniview (UNV) kamera ve kayıt cihazları için mobil izleme uygulaması.",
  },
  {
    brand: "UNV",
    logo: "/images/brands/unv.png",
    app: "EZStation",
    note: "Uniview (UNV) kamera ve kayıt cihazlarını bilgisayardan merkezi olarak yönetmek için ücretsiz VMS yazılımı.",
    mobile: false,
    desktop: { url: "https://www.uniview.com/Products/Software/PC/EZStation/" },
  },
  {
    brand: "Hanwha Vision",
    logo: "/images/brands/hanwha.png",
    app: "Wisenet Mobile",
    note: "Hanwha Vision (Wisenet) sistemleri için canlı izleme ve oynatma uygulaması.",
  },
  {
    brand: "Hanwha Vision",
    logo: "/images/brands/hanwha.png",
    app: "Wisenet Viewer",
    note: "Hanwha Vision (Wisenet) sistemlerini bilgisayardan izlemek ve yönetmek için masaüstü yazılımı.",
    mobile: false,
    desktop: { url: "https://www.hanwhavision.com/en/products/software/viewer/A/wisenet-viewer/" },
  },
  {
    brand: "IMOU",
    logo: "/images/brands/imou.webp",
    app: "IMOU Life",
    note: "IMOU kameraları için akıllı bildirimli mobil izleme uygulaması.",
  },
  {
    brand: "Ajax",
    logo: "/images/brands/ajax.png",
    app: "Ajax Security System",
    note: "Ajax hırsız alarm sisteminizi uzaktan kurun, devre dışı bırakın, olayları takip edin.",
  },
  {
    brand: "Ajax",
    logo: "/images/brands/ajax.png",
    app: "Ajax Desktop",
    note: "Ajax alarm sisteminizi bilgisayarınızdan tam ekran kontrol merkezi gibi yönetin, kameraları canlı izleyin.",
    mobile: false,
    desktop: { url: "https://ajax.systems/ajax-desktop/" },
  },
  {
    brand: "Paradox",
    logo: "/images/brands/paradox.png",
    app: "Insite Gold",
    note: "Paradox alarm panelinizi uzaktan kontrol edin ve bildirim alın.",
  },
  {
    brand: "Genel DVR/NVR",
    app: "XMEye",
    note: "Bazı ekonomik DVR/NVR modelleri için mobil canlı izleme uygulaması.",
  },
  {
    brand: "Genel DVR/NVR",
    app: "hiEasy",
    note: "Bazı kayıt cihazı modellerinin basit kurulum ve izleme uygulaması.",
  },
  {
    brand: "Genel DVR/NVR",
    app: "P6S Lite",
    note: "Bazı DVR/NVR modelleri için mobil canlı izleme uygulaması.",
  },
  {
    brand: "WiFi Kamera",
    app: "O-Kam Pro",
    note: "Bazı WiFi IP kamera modelleri için mobil izleme uygulaması.",
  },
  {
    brand: "Akıllı Ev",
    app: "Tuya Smart",
    note: "Akıllı priz, anahtar, sensör gibi cihazlarınızı tek uygulamadan yönetin.",
  },
  {
    brand: "Uzaktan Destek",
    app: "AnyDesk",
    note: "Teknik ekibimizin, izninizle bilgisayarınıza uzaktan bağlanıp destek verebilmesi için kullanılır.",
    desktop: { url: "https://anydesk.com/en/downloads/windows" },
  },
  {
    brand: "Uzaktan Destek",
    app: "TeamViewer",
    note: "Teknik ekibimizin, izninizle bilgisayarınıza uzaktan bağlanıp destek verebilmesi için kullanılır.",
    desktop: { url: "https://www.teamviewer.com/en/download/windows/" },
  },
];

function storeSearchUrl(store: "ios" | "android", query: string): string {
  if (store === "ios") return `https://apps.apple.com/tr/search?term=${encodeURIComponent(query)}`;
  return `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
}

export default async function MobilUygulamalarPage() {
  const site = await getResolvedSite();
  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Destek"
          title="Mobil Uygulamalar"
          subtitle="Kurduğumuz sistemin markasına göre aşağıdaki uygulamayı indirerek kameralarınızı, alarmınızı her yerden canlı takip edebilirsiniz. Kurulum sırasında teknisyenimiz uygulamayı sizin için hazır hale getirir."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {APPS.map((a) => (
            <div
              key={a.app}
              className="flex items-start gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-ink/8 bg-surface p-2">
                {a.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logo} alt={a.brand} className="max-h-8 w-full object-contain" />
                ) : (
                  <Icon name="download" className="h-6 w-6 text-brand/60" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{a.brand}</p>
                <p className="mt-0.5 font-bold text-ink">{a.app}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">{a.note}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.mobile !== false && (
                    <>
                      <a
                        href={storeSearchUrl("ios", a.app)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand/50 hover:text-brand"
                      >
                        App Store
                      </a>
                      <a
                        href={storeSearchUrl("android", a.app)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand/50 hover:text-brand"
                      >
                        Google Play
                      </a>
                    </>
                  )}
                  {a.desktop && (
                    <a
                      href={a.desktop.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white"
                    >
                      <Icon name="download" className="h-3.5 w-3.5" />
                      Bilgisayara İndir
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-ink/8 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-ink">Kullandığınız markanın uygulamasını bulamadınız mı?</p>
          <p className="mt-1 text-sm text-ink/55">
            Kurulumunuzda hangi cihaz/marka olduğunu bilmiyorsanız bizi arayın, doğru uygulamayı birlikte
            bulup telefonunuza kuralım.
          </p>
          <a
            href={site.phoneHref}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
          >
            <Icon name="phone" className="h-4 w-4" />
            {site.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
