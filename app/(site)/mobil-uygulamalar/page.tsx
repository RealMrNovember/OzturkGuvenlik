import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Icon } from "@/components/icons";
import { MobilUygulamalarGrid } from "@/components/MobilUygulamalarGrid";
import { MOBILE_APPS } from "@/lib/mobile-apps";
import { getResolvedSite } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Mobil Uygulamalar",
  description:
    "Kurduğumuz kamera ve alarm sistemlerini telefonunuzdan ve bilgisayarınızdan canlı izlemek için kullanacağınız marka uygulamaları ve indirme bağlantıları.",
  alternates: { canonical: "/mobil-uygulamalar" },
};

export default async function MobilUygulamalarPage() {
  const site = await getResolvedSite();
  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Destek"
          title="Mobil Uygulamalar"
          subtitle="Kurduğumuz sistemin markasına göre aşağıdaki uygulamayı indirerek kameralarınızı, alarmınızı her yerden canlı takip edebilirsiniz. Kategoriye göre filtreleyerek kendi sisteminizi hızlıca bulun."
        />

        <div className="mt-10">
          <MobilUygulamalarGrid apps={MOBILE_APPS} />
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
