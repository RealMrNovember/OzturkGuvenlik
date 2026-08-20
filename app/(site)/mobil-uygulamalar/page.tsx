import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Icon } from "@/components/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mobil Uygulamalar",
  description:
    "Kurduğumuz kamera ve alarm sistemlerini telefonunuzdan canlı izlemek için kullanacağınız marka uygulamaları ve indirme bağlantıları.",
};

type App = { brand: string; logo: string; app: string; note: string };

const APPS: App[] = [
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "Hik-Connect",
    note: "IP kamera ve NVR/DVR cihazlarınızı canlı izleyin, kayıtlara erişin, bildirim alın.",
  },
  {
    brand: "Dahua",
    logo: "/images/brands/dahua.png",
    app: "gDMSS Plus",
    note: "Dahua kamera ve kayıt cihazları için canlı izleme ve bildirim uygulaması.",
  },
  {
    brand: "EZVIZ",
    logo: "/images/brands/ezviz.png",
    app: "EZVIZ",
    note: "EZVIZ kameralarınızı tek uygulamadan yönetin, hareket bildirimlerini anında alın.",
  },
  {
    brand: "UNV",
    logo: "/images/brands/unv.png",
    app: "EZView",
    note: "Uniview (UNV) kamera ve kayıt cihazları için mobil izleme uygulaması.",
  },
  {
    brand: "Hanwha Vision",
    logo: "/images/brands/hanwha.png",
    app: "Wisenet Mobile",
    note: "Hanwha Vision (Wisenet) sistemleri için canlı izleme ve oynatma uygulaması.",
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
    brand: "Paradox",
    logo: "/images/brands/paradox.png",
    app: "Insite Gold",
    note: "Paradox alarm panelinizi uzaktan kontrol edin ve bildirim alın.",
  },
];

function storeSearchUrl(store: "ios" | "android", query: string): string {
  if (store === "ios") return `https://apps.apple.com/tr/search?term=${encodeURIComponent(query)}`;
  return `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
}

export default function MobilUygulamalarPage() {
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
              key={a.brand}
              className="flex items-start gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-ink/8 bg-surface p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.logo} alt={a.brand} className="max-h-8 w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{a.brand}</p>
                <p className="mt-0.5 font-bold text-ink">{a.app}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">{a.note}</p>
                <div className="mt-3 flex gap-2">
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
