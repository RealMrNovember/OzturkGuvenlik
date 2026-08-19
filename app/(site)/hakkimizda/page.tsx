import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ReviewsSection } from "@/components/ReviewsSection";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `2014'ten beri Yenibosna'da güvenlik sistemleri sektöründe hizmet veren ${site.name}. Kuruluş hikayemiz, değerlerimiz ve ekibimiz.`,
};

const values = [
  {
    title: "İşini temiz yapmak",
    desc: "Görünmeyen kablo, özensiz montaj yok. İşi teslim etmeden kendimiz test ederiz.",
    icon: "check" as const,
  },
  {
    title: "Şeffaf teklif",
    desc: "Keşifte net konuşuruz: hangi ürün, hangi gerekçe, ne kadar. Sürpriz yok.",
    icon: "file" as const,
  },
  {
    title: "Sözünde durmak",
    desc: "Randevu saatinde geliriz, vaat ettiğimiz sürede teslim ederiz.",
    icon: "clock" as const,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-light">
              Hakkımızda
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
              Saha işiyle büyümüş bir aile işletmesi.
            </h1>
            <p className="mt-4 max-w-2xl text-white/70">
              2014'ten beri Yenibosna'dayız. Reklamdan çok, kurduğumuz sistemin
              çalışmasıyla tanınıyoruz.
            </p>
          </Reveal>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_400px]">
            <div className="space-y-5">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Hikâyemiz
                </h2>
              </Reveal>
              {[
                "Öztürk Güvenlik Sistemleri, 2014 yılında Recep Özkan Öztürk tarafından Yenibosna'da kuruldu. İlk günkü iş anlayışımız değişmedi: önce sahada işinizi doğru yapmak, sonra büyümek.",
                "Bugüne kadar iş yerleri, siteler, apartmanlar, depo ve fabrikalara güvenlik kamerası, alarm, geçiş kontrolü ve bina teknolojileri kurduk. Müşterilerimizin çoğu bizi tavsiye üzerine buldu; Google'daki yorumlarımız bu işin belgesi.",
                "Küçük ekibimizle her projeye bizzat gidiyoruz: keşfi yapan, teklifi veren ve kurulumu yöneten aynı ekip. Bu yüzden verdiğimiz sözlerin arkasında durabiliyoruz.",
              ].map((p, i) => (
                <Reveal key={i} delay={i * 70}>
                  <p className="leading-relaxed text-ink/70">{p}</p>
                </Reveal>
              ))}
              <Reveal delay={220}>
                <div className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-surface p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/ozkan.jpg"
                    alt="Recep Özkan Öztürk"
                    width={80}
                    height={107}
                    className="h-20 w-15 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold text-ink">{site.ceo}</p>
                    <p className="text-sm text-ink/60">Kurucu · Sahada bizzat yer alır</p>
                    <p className="mt-1 text-xs text-ink/45">
                      {site.founded} yılından beri güvenlik sistemleri sektöründe.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={150}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/is-2.jpg"
                alt="Öztürk Güvenlik saha çalışması"
                width={2000}
                height={1500}
                className="w-full rounded-3xl object-cover shadow-lg"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Değerlerimiz"
            title="Bizi tavsiye ettiren 3 şey"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon name={v.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <CtaBand
        title="Siz de bizimle çalışın."
        subtitle="Keşif ücretsizdir. Bizi tanımak için önce bir telefon açmanız yeterli."
      />
    </>
  );
}
