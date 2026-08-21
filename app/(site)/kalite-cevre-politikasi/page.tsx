import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/icons";
import { getResolvedSite } from "@/lib/site-settings";
import type { IconName } from "@/lib/services";

export const metadata: Metadata = {
  title: "Kalite ve Çevre Politikamız",
  description:
    "Öztürk Güvenlik Sistemleri'nin kalite, müşteri memnuniyeti ve çevreye duyarlı çalışma ilkeleri.",
};

const QUALITY_PRINCIPLES = [
  {
    icon: "shield" as const,
    title: "Orijinal ürün, resmi garanti",
    desc: "Yalnızca yetkili iş ortaklarımızdan temin ettiğimiz orijinal ürünleri kullanır, her kurulumu resmi garanti kapsamında teslim ederiz.",
  },
  {
    icon: "wrench" as const,
    title: "İşçilikte titizlik",
    desc: "Kablolamadan cihaz konfigürasyonuna kadar her adımı, uzun ömürlü ve bakımı kolay bir sistem hedefiyle standart bir kontrol listesine göre tamamlarız.",
  },
  {
    icon: "clock" as const,
    title: "Zamanında teslim, şeffaf süreç",
    desc: "Keşifte verdiğimiz süre ve fiyat taahhüdüne bağlı kalır, süreç boyunca müşterimizi bilgilendiririz.",
  },
  {
    icon: "refresh" as const,
    title: "Sürekli iyileştirme",
    desc: "Saha geri bildirimlerini ve müşteri yorumlarını düzenli değerlendirir, hizmet standartlarımızı buna göre güncelleriz.",
  },
];

const ENVIRONMENT_PRINCIPLES = [
  {
    icon: "box" as const,
    title: "Ambalaj ve atık yönetimi",
    desc: "Kurulum sonrası ambalaj atıklarını sahada bırakmaz, geri dönüşüm süreçlerine dahil ederiz.",
  },
  {
    icon: "hdd" as const,
    title: "Elektronik atık",
    desc: "Değişimi yapılan arızalı cihaz ve kartları, çevreye zarar vermeyecek şekilde uygun toplama noktalarına yönlendiririz.",
  },
  {
    icon: "palette" as const,
    title: "Enerji verimli çözümler",
    desc: "Mümkün olduğunda düşük güç tüketimli cihazları ve akıllı zamanlama/otomasyon ayarlarını öneririz.",
  },
  {
    icon: "car" as const,
    title: "Verimli saha planlaması",
    desc: "Aynı bölgedeki keşif ve kurulumları planlayarak gereksiz sefer ve yakıt tüketimini azaltırız.",
  },
];

type Principle = { icon: IconName; title: string; desc: string };

function PrincipleGrid({ items }: { items: Principle[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((p) => (
        <div key={p.title} className="flex gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon name={p.icon} className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-ink">{p.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/60">{p.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function KaliteCevrePolitikasiPage() {
  const site = await getResolvedSite();
  return (
    <>
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Kurumsal"
            title="Kalite ve Çevre Politikamız"
            subtitle={`${site.founded} yılından bu yana güvenlik sistemleri kurduğumuz her projede, işi doğru yapmayı ve çevreye karşı sorumlu davranmayı aynı önemde görüyoruz.`}
          />

          <div className="mt-12">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/45">
              Kalite ilkelerimiz
            </h2>
            <PrincipleGrid items={QUALITY_PRINCIPLES} />
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/45">
              Çevre ilkelerimiz
            </h2>
            <PrincipleGrid items={ENVIRONMENT_PRINCIPLES} />
          </div>

          <p className="mt-10 rounded-2xl bg-white px-6 py-5 text-center text-sm text-ink/55 shadow-sm">
            Bu ilkeler tüm ekibimiz ve iş ortaklarımız için bağlayıcıdır; sahada bu standartların dışına
            çıkıldığını fark ederseniz bize{" "}
            <a href={site.phoneHref} className="font-semibold text-brand">
              {site.phoneDisplay}
            </a>{" "}
            numarasından bildirebilirsiniz.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
