"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import type { IconName } from "@/lib/services";
import {
  APP_CATEGORY_ICON,
  APP_CATEGORY_LABEL,
  CATEGORY_ORDER,
  storeSearchUrl,
  type AppCategory,
  type MobileApp,
} from "@/lib/mobile-apps";

type FilterValue = AppCategory | "all";

export function MobilUygulamalarGrid({ apps }: { apps: MobileApp[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const countByCategory = useMemo(() => {
    const counts = {} as Record<AppCategory, number>;
    for (const cat of CATEGORY_ORDER) counts[cat] = apps.filter((a) => a.category === cat).length;
    return counts;
  }, [apps]);

  const visibleCategories = filter === "all" ? CATEGORY_ORDER : [filter];

  return (
    <div>
      <div role="tablist" aria-label="Uygulama kategorileri" className="flex flex-wrap justify-center gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Tümü"
          count={apps.length}
        />
        {CATEGORY_ORDER.map((cat) => (
          <FilterPill
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={APP_CATEGORY_LABEL[cat]}
            count={countByCategory[cat]}
            icon={APP_CATEGORY_ICON[cat]}
          />
        ))}
      </div>

      <div className="mt-10 space-y-10">
        {visibleCategories.map((cat) => {
          const items = apps.filter((a) => a.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon name={APP_CATEGORY_ICON[cat]} className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink/70">
                  {APP_CATEGORY_LABEL[cat]}
                </h2>
                <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
                <span className="text-xs font-semibold text-ink/40">{items.length} uygulama</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((a) => (
                  <AppCard key={a.app} app={a} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: IconName;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand text-white shadow-sm"
          : "border border-ink/12 bg-white text-ink/65 hover:border-brand/40 hover:text-brand"
      }`}
    >
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {label}
      <span
        className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
          active ? "bg-white/20" : "bg-ink/8 text-ink/45"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function AppCard({ app: a }: { app: MobileApp }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-ink/8 bg-surface p-2">
        {a.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.logo} alt={a.brand} className="max-h-8 w-full object-contain" />
        ) : (
          <Icon name="download" className="h-6 w-6 text-brand/60" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{a.brand}</p>
        <p className="mt-0.5 font-bold text-ink">{a.app}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">{a.note}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {a.mobile !== false && (
            <>
              <a
                href={storeSearchUrl("ios", a.app)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand/50 hover:text-brand"
              >
                App Store
              </a>
              <a
                href={storeSearchUrl("android", a.app)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-brand/50 hover:text-brand"
              >
                Google Play
              </a>
            </>
          )}
          {a.desktop && (
            <a
              href={a.desktop.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Bilgisayara İndir
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
