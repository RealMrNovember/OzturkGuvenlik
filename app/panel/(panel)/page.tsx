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
} from "@/components/panel/ui";

type DashboardData = {
  counts: { newRequests: number; awaitingCalls: number; activeJobs: number };
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
      label: "Yeni keşif talebi",
      value: data.counts.newRequests,
      href: "/panel/talepler?status=yeni",
      icon: "arrow" as const,
      tone: "bg-brand/10 text-brand",
    },
    {
      label: "Aranacak talep",
      value: data.counts.awaitingCalls,
      href: "/panel/talepler?status=aranacak",
      icon: "phone" as const,
      tone: "bg-amber-500/10 text-amber-700",
    },
    {
      label: "Devam eden iş",
      value: data.counts.activeJobs,
      href: "/panel/isler",
      icon: "briefcase" as const,
      tone: "bg-violet-500/10 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Panel</h1>
        <p className="mt-1 text-sm text-ink/55">Bugüne genel bakış</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

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
  );
}