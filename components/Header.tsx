"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useSite } from "@/components/SiteContext";
import { resolvedWaLinkDefault } from "@/lib/site-resolve";
import { services, type IconName } from "@/lib/services";
import { Icon } from "@/components/icons";

type DropdownItem = { href: string; label: string; icon: IconName };

const SERVICE_ITEMS: DropdownItem[] = services.map((s) => ({ href: `/hizmetler/${s.slug}`, label: s.name, icon: s.icon }));

const SUPPORT_ITEMS: DropdownItem[] = [
  { href: "/hesaplama", label: "HDD Hesaplama", icon: "calculator" },
  { href: "/sss", label: "Sıkça Sorulan Sorular", icon: "help" },
  { href: "/mobil-uygulamalar", label: "Mobil Uygulamalar", icon: "download" },
];

const CORPORATE_ITEMS: DropdownItem[] = [
  { href: "/hakkimizda", label: "Hakkımızda", icon: "briefcase" },
  { href: "/kalite-cevre-politikasi", label: "Kalite ve Çevre Politikamız", icon: "shield" },
  { href: "/markalarimiz", label: "Markalarımız", icon: "star" },
  { href: "/is-ortaklarimiz", label: "İş Ortaklarımız", icon: "users" },
  { href: "/referanslarimiz", label: "Referanslarımız", icon: "check" },
];

const nav = [
  { key: "home", href: "/", label: "Ana Sayfa" },
  { key: "hizmetler", href: "/hizmetler", label: "Hizmetler", items: SERVICE_ITEMS, layout: "grid" as const },
  { key: "destek", href: null, label: "Destek", items: SUPPORT_ITEMS, layout: "list" as const },
  { key: "kurumsal", href: null, label: "Kurumsal", items: CORPORATE_ITEMS, layout: "list" as const },
  { key: "iletisim", href: "/iletisim", label: "İletişim" },
];

const CLOSE_DELAY_MS = 400;

function NavDropdown({
  label,
  href,
  items,
  layout,
  active,
}: {
  label: string;
  href: string | null;
  items: DropdownItem[];
  layout: "grid" | "list";
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const triggerClass = `flex items-center gap-1 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
    active ? "text-brand-light" : "text-white/80 hover:text-white"
  }`;
  const arrow = <Icon name="arrow" className={`h-3 w-3 rotate-90 transition-transform ${open ? "-rotate-90" : ""}`} />;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      {href ? (
        <Link href={href} className={triggerClass} aria-expanded={open}>
          {label}
          {arrow}
        </Link>
      ) : (
        <button type="button" onClick={() => setOpen((o) => !o)} className={triggerClass} aria-expanded={open}>
          {label}
          {arrow}
        </button>
      )}

      {open && (
        <div
          className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 ${layout === "grid" ? "w-[560px]" : "w-72"}`}
        >
          <div
            className={`rounded-2xl border border-ink/8 bg-white p-3 shadow-2xl ${
              layout === "grid" ? "grid grid-cols-2 gap-1" : "flex flex-col gap-1"
            }`}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/80 transition-colors hover:bg-surface hover:text-ink"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavAccordion({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: DropdownItem[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium text-white/85"
      >
        {label}
        <Icon name="arrow" className={`h-3.5 w-3.5 rotate-90 transition-transform ${open ? "-rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="ml-3 flex flex-col border-l border-white/10 pl-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="rounded-md px-3 py-2.5 text-sm text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const site = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink/92 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={site.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt={site.name}
            className="h-11 w-auto object-contain"
            width={110}
            height={44}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {nav.map((item) =>
            item.items ? (
              <NavDropdown
                key={item.key}
                label={item.label}
                href={item.href}
                items={item.items}
                layout={item.layout}
                active={item.href ? pathname.startsWith(item.href) : item.items.some((i) => pathname.startsWith(i.href))}
              />
            ) : (
              <Link
                key={item.key}
                href={item.href as string}
                className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href ? "text-brand-light" : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            <Icon name="phone" className="h-4 w-4 text-brand-light" />
            {site.phoneDisplay}
          </a>
          <Link
            href="/kesif"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-light hover:shadow-brand-light/30"
          >
            Ücretsiz Keşif
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menüyü aç/kapat"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink px-4 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobil menü">
            {nav.map((item) =>
              item.items ? (
                <MobileNavAccordion
                  key={item.key}
                  label={item.label}
                  items={item.items}
                  onNavigate={() => setOpen(false)}
                />
              ) : (
                <Link
                  key={item.key}
                  href={item.href as string}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-base font-medium ${
                    pathname === item.href ? "text-brand-light" : "text-white/85"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href={site.phoneHref}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white"
            >
              <Icon name="phone" className="h-4 w-4" />
              {site.phoneDisplay}
            </a>
            <a
              href={resolvedWaLinkDefault(site)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-wa px-4 py-3 text-sm font-semibold text-white"
            >
              <Icon name="whatsapp" className="h-4 w-4" />
              WhatsApp'tan Yaz
            </a>
            <Link
              href="/kesif"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              Ücretsiz Keşif
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
