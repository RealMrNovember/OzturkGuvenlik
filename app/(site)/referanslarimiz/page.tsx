import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/icons";
import { getResolvedSite } from "@/lib/site-settings";
import { reviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Referanslarımız",
  description: "Öztürk Güvenlik Sistemleri müşteri yorumları ve referansları.",
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");
}

export default async function ReferanslarimizPage() {
  const site = await getResolvedSite();
  return (
    <>
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Kurumsal"
            title="Referanslarımız"
            subtitle="Konut, iş yeri, site ve depo projelerinde birlikte çalıştığımız müşterilerimizin gerçek deneyimleri."
          />

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-semibold text-ink shadow-sm">
              <Icon name="star" className="h-4 w-4 text-[#F5A623]" />
              {site.rating} Google puanı
              <span className="text-ink/50">·</span>
              <span className="text-ink/70">{site.reviewCount}+ gerçek müşteri yorumu</span>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.name}
                className="accent-frame-left flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-1 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Icon key={j} name="star" className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/75">
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${r.color} text-sm font-bold text-white`}
                  >
                    {initials(r.name)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-ink/50">{r.time}</p>
                  </div>
                </figcaption>
              </figure>
            ))}

            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-ink p-6 text-center">
              <Icon name="star" className="h-8 w-8 text-[#F5A623]" />
              <p className="text-lg font-bold text-white">{site.reviewCount}+ yorum, tam puan.</p>
              <p className="text-sm text-white/70">Google&apos;daki tüm yorumları inceleyin.</p>
              <a
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                Google&apos;da Görüntüle
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <CtaBand
        title="Siz de referanslarımız arasına katılın."
        subtitle="Keşif ücretsizdir. Uzman ekibimiz ihtiyacınızı yerinde değerlendirir, size uygun çözümü belirler."
      />
    </>
  );
}
