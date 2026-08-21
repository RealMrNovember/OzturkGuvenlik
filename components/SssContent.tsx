"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { Icon } from "@/components/icons";
import { services } from "@/lib/services";
import { GENERAL_FAQS } from "@/lib/faqs";
import { useSite } from "@/components/SiteContext";

const GROUPS: { key: "genel" | "kamera" | "alarm" | "gecis" | "diger"; title: string }[] = [
  { key: "genel", title: "Genel" },
  { key: "kamera", title: "Kamera Sistemleri" },
  { key: "alarm", title: "Alarm Sistemleri" },
  { key: "gecis", title: "Geçiş Kontrolü" },
  { key: "diger", title: "Diğer Sistemler" },
];

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-ink">{item.q}</span>
              <Icon
                name="arrow"
                className={`h-4 w-4 shrink-0 text-brand transition-transform ${open ? "rotate-90" : ""}`}
              />
            </button>
            {open && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/60">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function SssContent() {
  const site = useSite();
  return (
    <section className="bg-surface py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Destek"
          title="Sıkça Sorulan Sorular"
          subtitle="Kurulum, garanti, bakım ve ödeme hakkında en çok merak edilenler. Aradığınızı bulamazsanız bize doğrudan ulaşabilirsiniz."
        />

        <div className="mt-10 space-y-10">
          {GROUPS.map((group) => {
            const items =
              group.key === "genel"
                ? GENERAL_FAQS
                : services.filter((s) => s.group === group.key).flatMap((s) => s.faqs);
            if (items.length === 0) return null;
            return (
              <div key={group.key}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink/45">
                  {group.title}
                </h2>
                <Accordion items={items} />
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-ink/8 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-ink">Sorunuzun cevabını bulamadınız mı?</p>
          <p className="mt-1 text-sm text-ink/55">Bize ulaşın, size yardımcı olalım.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
            >
              <Icon name="phone" className="h-4 w-4" />
              {site.phoneDisplay}
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand/50"
            >
              İletişim sayfası
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
