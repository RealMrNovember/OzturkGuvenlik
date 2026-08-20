import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { brands } from "@/lib/brands";

export const metadata: Metadata = {
  title: "İş Ortaklarımız",
  description:
    "Öztürk Güvenlik Sistemleri'nin çözüm ortağı olduğu üretici ve teknoloji firmaları — kamera, alarm, geçiş kontrolü, network ve depolama alanlarında.",
};

export default function IsOrtaklarimizPage() {
  return (
    <>
      <section className="bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Kurumsal"
            title="İş Ortaklarımız"
            subtitle="Güvenlik ve otomasyon ekosisteminin önde gelen üretici ve teknoloji firmalarıyla doğrudan iş birliği içindeyiz. Bu sayede orijinal ürün, resmi garanti ve sürekli teknik destek garanti ederiz."
          />

          <div className="mt-10 flex flex-wrap justify-center gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
            {brands.map((b) => (
              <div
                key={b.name}
                className="group flex w-36 shrink-0 grow-0 items-center justify-center bg-white px-6 py-7 transition-colors duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.src}
                  alt={b.name}
                  className="max-h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-9"
                />
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-ink/50">
            Listede yer alan tüm markaların ürünlerini stoklu şekilde temin edebiliyor, orijinal parça ve
            resmi garanti süreçlerini sizin adınıza yürütüyoruz.
          </p>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
