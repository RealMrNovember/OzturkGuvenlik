import { Reveal } from "@/components/Reveal";

type Brand = { name: string; src: string };

const brands: Brand[] = [
  { name: "Hikvision", src: "/images/brands/hikvision.png" },
  { name: "Dahua", src: "/images/brands/dahua.png" },
  { name: "UNV", src: "/images/brands/unv.png" },
  { name: "Hanwha Vision", src: "/images/brands/hanwha.png" },
  { name: "EZVIZ", src: "/images/brands/ezviz.png" },
  { name: "IMOU", src: "/images/brands/imou.webp" },
  { name: "Tiandy", src: "/images/brands/tiandy.png" },
  { name: "TVT", src: "/images/brands/tvt.png" },
  { name: "Kedacom", src: "/images/brands/kedacom.webp" },
  { name: "Sanjiang", src: "/images/brands/sanjiang.webp" },
  { name: "ZKTeco", src: "/images/brands/zkteco.png" },
  { name: "Suprema", src: "/images/brands/suprema.png" },
  { name: "Ajax", src: "/images/brands/ajax.png" },
  { name: "Paradox", src: "/images/brands/paradox.png" },
  { name: "DSC", src: "/images/brands/dsc.png" },
  { name: "Caddx", src: "/images/brands/caddx.png" },
  { name: "Teletek", src: "/images/brands/teletek.png" },
  { name: "Roombanker", src: "/images/brands/roombanker.png" },
  { name: "Honeywell", src: "/images/brands/honeywell.png" },
  { name: "Grandstream", src: "/images/brands/grandstream.png" },
  { name: "Wi-Tek", src: "/images/brands/witek.png" },
  { name: "Ruijie Reyee", src: "/images/brands/reyee.png" },
  { name: "Kodicom", src: "/images/brands/kodicom.png" },
  { name: "Future KNX", src: "/images/brands/knx-future.svg" },
  { name: "Aypro", src: "/images/brands/aypro.svg" },
  { name: "Toshiba", src: "/images/brands/toshiba.png" },
  { name: "Western Digital", src: "/images/brands/wd.png" },
  { name: "Seagate", src: "/images/brands/seagate.png" },
  { name: "TP-Link", src: "/images/brands/tplink.png" },
  { name: "TTEC", src: "/images/brands/ttec.png" },
  { name: "Formrack", src: "/images/brands/formrack.png" },
  { name: "Westa", src: "/images/brands/westa.png" },
  { name: "Decon", src: "/images/brands/decon.png" },
];

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="max-h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-9"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
