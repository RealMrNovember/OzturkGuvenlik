import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { brands } from "@/lib/brands";

export function BrandsShowcase() {
  return (
    <section className="border-y border-ink/8 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink/40">
            Kurulumlarımızda kullandığımız iş ortağı markalar
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap justify-center gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="group flex w-36 shrink-0 grow-0 items-center justify-center bg-white px-6 py-7 transition-colors duration-300"
              >
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={144}
                  height={36}
                  className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-9"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
