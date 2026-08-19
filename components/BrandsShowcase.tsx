import { Reveal } from "@/components/Reveal";

type Brand = { name: string; src: string };

const brands: Brand[] = [
  { name: "UNV", src: "/images/brands/unv.png" },
  { name: "ZKTeco", src: "/images/brands/zkteco.png" },
  { name: "Seagate", src: "/images/brands/seagate.png" },
  { name: "Western Digital", src: "/images/brands/wd.png" },
  { name: "TP-Link", src: "/images/brands/tplink.png" },
];

export function BrandsShowcase() {
  return (
    <section className="border-y border-ink/8 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink/40">
            Kurulumlarımızda kullandığımız başlıca markalar
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-5">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="group flex items-center justify-center bg-white px-8 py-9 transition-colors duration-300 hover:bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="max-h-9 w-auto object-contain opacity-80 grayscale transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-10"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
