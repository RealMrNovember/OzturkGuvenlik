"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site, waLinkDefault } from "@/lib/site";
import { Icon } from "@/components/icons";

const nav = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function Header() {
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
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-brand-light"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
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
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-3 text-base font-medium ${
                  pathname === item.href ? "text-brand-light" : "text-white/85"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
              href={waLinkDefault()}
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
