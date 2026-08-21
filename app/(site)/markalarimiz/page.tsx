import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { CORE_PRODUCT_BRANDS, BRAND_CATEGORY_LABEL, type BrandCategory } from "@/lib/brands";

export const metadata: Metadata = {
  title: "Markalarımız",
  description:
    "Kurulumlarımızda kullandığımız kamera, alarm ve geçiş kontrolü sistemi markaları: Hikvision, Dahua, UNV, Hanwha Vision, Ajax, Paradox ve daha fazlası.",
  alternates: { canonical: "/markalarimiz" },
};

const CATEGORY_ORDER: BrandCategory[] = ["kamera", "alarm", "gecis"];

export default function MarkalarimizPage() {
  return (
    <>
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Kurumsal"
            title="Markalarımız"
            subtitle="Sistemlerimizi, sektörün alanında kanıtlanmış ve yaygın destek ağına sahip markalarıyla kuruyoruz. Her proje için ihtiyaca ve bütçeye en uygun markayı birlikte belirliyoruz."
          />

          <div className="mt-12 space-y-10">
            {CATEGORY_ORDER.map((cat) => {
              const items = CORE_PRODUCT_BRANDS.filter((b) => b.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink/45">
                    {BRAND_CATEGORY_LABEL[cat]}
                  </h2>
                  <div className="flex flex-wrap gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
                    {items.map((b) => (
                      <div
                        key={b.name}
                        className="group flex w-40 shrink-0 grow-0 items-center justify-center bg-white px-6 py-8 transition-colors duration-300"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.src}
                          alt={b.name}
                          className="max-h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
