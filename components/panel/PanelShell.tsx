"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/panel/ui";

export const PanelContext = createContext<{ role: string; name: string; id: number }>({
  role: "staff",
  name: "",
  id: 0,
});

export function usePanelRole() {
  return useContext(PanelContext).role;
}

export function usePanelSession() {
  return useContext(PanelContext);
}

const nav = [
  { href: "/panel", label: "Panel", icon: "home" as const },
  { href: "/panel/talepler", label: "Keşif Talepleri", icon: "arrow" as const },
  { href: "/panel/randevular", label: "Randevular", icon: "calendar" as const },
  { href: "/panel/musteriler", label: "Müşteriler", icon: "users" as const },
  { href: "/panel/teklifler", label: "Teklifler", icon: "file" as const },
  { href: "/panel/isler", label: "İşler", icon: "briefcase" as const },
  { href: "/panel/servis", label: "Servis", icon: "wrench" as const },
  { href: "/panel/bakim", label: "Bakım Sözleşmeleri", icon: "clock" as const },
  { href: "/panel/faturalar", label: "Faturalar", icon: "receipt" as const },
  { href: "/panel/kasa", label: "Kasa", icon: "wallet" as const },
  { href: "/panel/urunler", label: "Ürünler", icon: "box" as const },
  { href: "/panel/personel", label: "Personel", icon: "shield" as const },
  { href: "/panel/hizmet-medya", label: "Hizmet Videoları", icon: "video" as const, adminOnly: true },
  { href: "/panel/ayarlar", label: "Site Ayarları", icon: "palette" as const, adminOnly: true },
];

function SidebarLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const role = usePanelRole();
  return (
    <nav className="flex flex-col gap-1" aria-label="Panel menüsü">
      {nav.filter((item) => !item.adminOnly || role === "admin").map((item) => {
        const active =
          item.href === "/panel" ? pathname === "/panel" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand/15 text-brand-light"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon name={item.icon} className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PanelShell({
  session,
  children,
}: {
  session: { name: string; role: string; id: number };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/panel/giris");
    router.refresh();
  };

  return (
    <PanelContext.Provider value={{ role: session.role, name: session.name, id: session.id }}>
      <div className="min-h-dvh bg-surface">
      {/* Mobil üst bar */}
      <div className="flex items-center justify-between border-b border-ink/8 bg-white px-4 py-3 lg:hidden">
        <Link href="/panel" className="text-sm font-bold text-ink">
          Öztürk Güvenlik <span className="text-brand">· Panel</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Menüyü aç/kapat"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink"
        >
          <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>

      {/* Mobil menü */}
      {menuOpen && (
        <div className="border-b border-ink/8 bg-ink px-4 py-4 lg:hidden">
            <SidebarLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/65 hover:text-white"
          >
            <Icon name="logout" className="h-4.5 w-4.5" />
            Çıkış Yap
          </button>
        </div>
      )}

      <div className="flex">
        {/* Masaüstü kenar çubuğu */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-ink lg:flex">
          <Link href="/panel" className="flex shrink-0 items-center gap-2 p-4 pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-square.png"
              alt=""
              className="h-9 w-9 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-bold text-white">
                Öztürk <span className="text-brand-light">Güvenlik</span>
              </p>
              <p className="text-[11px] text-white/45">Yönetim Paneli</p>
            </div>
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-1">
            <SidebarLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </div>
          <div className="shrink-0 border-t border-white/10 p-4">
            <p className="px-3.5 text-sm font-semibold text-white">{session.name}</p>
            <div className="mt-1 flex items-center justify-between px-3.5">
              <Badge tone={session.role === "admin" ? "brand" : "gray"}>
                {session.role === "admin" ? "Yönetici" : "Personel"}
              </Badge>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-white/55 transition-colors hover:text-white"
              >
                <Icon name="logout" className="h-3.5 w-3.5" />
                Çıkış
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      </div>
    </PanelContext.Provider>
  );
}