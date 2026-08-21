import { getResolvedSite } from "@/lib/site-settings";
import { reviews } from "@/lib/reviews";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("");
}

export async function ReviewsSection() {
  const site = await getResolvedSite();
  return (
    <section id="yorumlar" className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-semibold text-ink">
              <Icon name="star" className="h-4 w-4 text-[#F5A623]" />
              {site.rating} Google puanı
              <span className="text-ink/50">·</span>
              <span className="text-ink/70">{site.reviewCount}+ gerçek müşteri yorumu</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Müşterilerimiz ne diyor?
            </h2>
            <p className="max-w-xl text-ink/60">
              Yorumlar Google üzerinden geliyor; tamamı gerçek müşteri deneyimleri.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <figure className="accent-frame-left flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-1 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Icon key={j} name="star" className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/75">
                  “{r.text}”
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
            </Reveal>
          ))}

          <Reveal delay={reviews.length * 80}>
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-ink p-6 text-center">
              <Icon name="star" className="h-8 w-8 text-[#F5A623]" />
              <p className="text-lg font-bold text-white">
                {site.reviewCount}+ yorum, tam puan.
              </p>
              <p className="text-sm text-white/70">
                Google'daki tüm yorumları inceleyin.
              </p>
              <a
                href={site.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                Google'da Görüntüle
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}