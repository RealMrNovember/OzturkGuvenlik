"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { Icon } from "@/components/icons";
import {
  Badge,
  Card,
  ErrorBox,
  Loading,
  StatusBadge,
  REQUEST_STATUS_LABEL,
  APPOINTMENT_STATUS_LABEL,
  fmtDateTime,
  fmtDate,
  fmtMoney,
  fmtMoneyWithTry,
  todayStr,
} from "@/components/panel/ui";

type DashboardData = {
  counts: {
    newRequests: number;
    awaitingCalls: number;
    openJobs: number;
    todayAppointments: number;
    pendingOffers: number;
    pendingInvoices: number;
    overdueInvoices: number;
    lowStockProducts: number;
    openTickets: number;
    upcomingMaintenance: number;
    overdueSupplierInvoices: number;
  };
  finance: { monthIncome: number; monthExpense: number; monthNet: number; payablesTotal: number };
  pendingInvoices: {
    id: number;
    number: string;
    total: string;
    currency: string;
    exchangeRate: string;
    dueDate: string | null;
    customerName: string | null;
    overdue: boolean;
  }[];
  overdueSupplierInvoices: {
    id: number;
    amount: string;
    currency: string;
    exchangeRate: string;
    dueDate: string | null;
    supplierName: string | null;
  }[];
  lowStockProducts: { id: number; name: string; stockQty: number }[];
  upcomingMaintenance: {
    id: number;
    type: string;
    nextServiceDate: string;
    customerName: string | null;
    customerPhone: string | null;
  }[];
  recentRequests: {
    id: number;
    name: string;
    placeType: string;
    systems: string[];
    status: string;
    createdAt: string;
  }[];
  todayAppointments: {
    id: number;
    title: string;
    time: string;
    status: string;
    assignedName: string | null;
    customerName: string | null;
  }[];
  upcomingAppointments: {
    id: number;
    title: string;
    date: string;
    time: string;
    status: string;
    assignedName: string | null;
    customerName: string | null;
  }[];
};

export default function PanelPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const statCards = [
    {
      label: "Açık iş",
      value: data.counts.openJobs,
      href: "/panel/isler",
      icon: "briefcase" as const,
      tone: "bg-violet-500/10 text-violet-700",
    },
    {
      label: "Bugünkü randevu",
      value: data.counts.todayAppointments,
      href: "/panel/randevular",
      icon: "calendar" as const,
      tone: "bg-brand/10 text-brand",
    },
    {
      label: "Bekleyen teklif",
      value: data.counts.pendingOffers,
      href: "/panel/teklifler",
      icon: "file" as const,
      tone: "bg-amber-500/10 text-amber-700",
    },
    {
      label: "Bekleyen tahsilat",
      value: data.counts.pendingInvoices,
      href: "/panel/faturalar",
      icon: "receipt" as const,
      tone: "bg-red-500/10 text-red-600",
    },
    {
      label: "Vadesi geçen tahsilat",
      value: data.counts.overdueInvoices,
      href: "/panel/faturalar",
      icon: "clock" as const,
      tone: "bg-red-500/10 text-red-600",
    },
    {
      label: "Açık servis kaydı",
      value: data.counts.openTickets,
      href: "/panel/servis",
      icon: "wrench" as const,
      tone: "bg-amber-500/10 text-amber-700",
    },
    {
      label: "Yaklaşan bakım",
      value: data.counts.upcomingMaintenance,
      href: "/panel/bakim",
      icon: "clock" as const,
      tone: "bg-violet-500/10 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Panel</h1>
        <p className="mt-1 text-sm text-ink/55">Bugüne genel bakış</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}>
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-black text-ink">{s.value}</p>
              <p className="text-xs font-semibold text-ink/55">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/panel/kasa"
          className="rounded-2xl border border-ink/8 bg-ink p-6 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Bu ay ciro</p>
          <p className="mt-2 text-3xl font-black text-white">{fmtMoney(data.finance.monthIncome)}</p>
        </Link>
        <Link
          href="/panel/kasa"
          className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
            Bu ay tahmini kâr
          </p>
          <p
            className={`mt-2 text-3xl font-black ${data.finance.monthNet >= 0 ? "text-emerald-600" : "text-red-500"}`}
          >
            {fmtMoney(data.finance.monthNet)}
          </p>
          <p className="mt-1 text-xs text-ink/40">
            Gelir {fmtMoney(data.finance.monthIncome)} − Gider {fmtMoney(data.finance.monthExpense)}
          </p>
        </Link>
        <Link
          href="/panel/tedarikciler"
          className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Tedarikçiye borcumuz</p>
          <p className="mt-2 text-3xl font-black text-ink">{fmtMoney(data.finance.payablesTotal)}</p>
          {data.counts.overdueSupplierInvoices > 0 && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {data.counts.overdueSupplierInvoices} fatura vadesi geçti
            </p>
          )}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Bugünkü randevular">
          {data.todayAppointments.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Bugün randevu yok.</div>
          ) : (
            data.todayAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {a.time} · {a.title || a.customerName || "Randevu"}
                  </p>
                  <p className="text-xs text-ink/50">
                    {a.customerName ?? "Müşteri yok"} · {a.assignedName ?? "Atanmadı"}
                  </p>
                </div>
                <StatusBadge status={a.status} labels={APPOINTMENT_STATUS_LABEL} />
              </div>
            ))
          )}
        </Card>

        <Card title="Tahsilat bekleyen faturalar" action={<Link href="/panel/faturalar" className="text-xs font-semibold text-brand">Tümü →</Link>}>
          {data.pendingInvoices.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Bekleyen tahsilat yok.</div>
          ) : (
            data.pendingInvoices.map((inv) => (
              <Link
                key={inv.id}
                href="/panel/faturalar"
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {inv.number}
                    {inv.overdue && (
                      <span className="ml-2 inline-flex">
                        <Badge tone="red">Vadesi geçti</Badge>
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {inv.customerName ?? "Müşteri yok"}
                    {inv.dueDate ? ` · Vade ${fmtDate(inv.dueDate)}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-ink">
                  {fmtMoneyWithTry(inv.total, inv.currency, inv.exchangeRate)}
                </p>
              </Link>
            ))
          )}
        </Card>

        <Card
          title="Vadesi geçen tedarikçi faturaları"
          action={<Link href="/panel/tedarikciler" className="text-xs font-semibold text-brand">Tümü →</Link>}
        >
          {data.overdueSupplierInvoices.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Vadesi geçen tedarikçi faturası yok.</div>
          ) : (
            data.overdueSupplierInvoices.map((inv) => (
              <Link
                key={inv.id}
                href="/panel/tedarikciler"
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{inv.supplierName ?? "Tedarikçi"}</p>
                  <p className="truncate text-xs text-ink/50">
                    {inv.dueDate ? `Vade ${fmtDate(inv.dueDate)}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-bold text-red-600">
                  {fmtMoneyWithTry(inv.amount, inv.currency, inv.exchangeRate)}
                </p>
              </Link>
            ))
          )}
        </Card>

        <Card
          title="Kritik stok"
          action={<Link href="/panel/urunler" className="text-xs font-semibold text-brand">Tümü →</Link>}
        >
          {data.lowStockProducts.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Kritik seviyede ürün yok.</div>
          ) : (
            data.lowStockProducts.map((p) => (
              <Link
                key={p.id}
                href="/panel/urunler"
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
              >
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <Badge tone="red">{p.stockQty} adet</Badge>
              </Link>
            ))
          )}
        </Card>

        <Card
          title="Yaklaşan bakım"
          action={<Link href="/panel/bakim" className="text-xs font-semibold text-brand">Tümü →</Link>}
        >
          {data.upcomingMaintenance.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Önümüzdeki 30 günde bakım yok.</div>
          ) : (
            data.upcomingMaintenance.map((m) => {
              const overdue = m.nextServiceDate < todayStr();
              return (
                <Link
                  key={m.id}
                  href="/panel/bakim"
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {m.customerName ?? "Müşteri yok"}
                    </p>
                    <p className="truncate text-xs text-ink/50">{m.type || "Bakım sözleşmesi"}</p>
                  </div>
                  <Badge tone={overdue ? "red" : "amber"}>{fmtDate(m.nextServiceDate)}</Badge>
                </Link>
              );
            })
          )}
        </Card>

        <Card title="Son keşif talepleri">
          {data.recentRequests.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">Henüz talep yok.</div>
          ) : (
            data.recentRequests.map((r) => (
              <Link
                key={r.id}
                href={`/panel/talepler#talep-${r.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ink/2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                  <p className="truncate text-xs text-ink/50">
                    {r.placeType || "-"} · {r.systems.length > 0 ? r.systems.length : 0} sistem ·{" "}
                    {fmtDateTime(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} labels={REQUEST_STATUS_LABEL} />
              </Link>
            ))
          )}
        </Card>

        <Card title="Önümüzdeki 7 gün — planlanan randevular">
          {data.upcomingAppointments.length === 0 ? (
            <div className="px-5 py-8 text-sm text-ink/50">
              Önümüzdeki hafta planlanmış randevu yok.
              <Link href="/panel/randevular" className="ml-2 font-semibold text-brand">
                Randevu oluştur
              </Link>
            </div>
          ) : (
            data.upcomingAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {a.date} · {a.time} — {a.title || a.customerName || "Randevu"}
                  </p>
                  <p className="text-xs text-ink/50">
                    {a.customerName ?? "Müşteri yok"} · {a.assignedName ?? "Atanmadı"}
                  </p>
                </div>
                <Badge tone="brand">Planlandı</Badge>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
