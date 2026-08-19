"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/fetch";
import { site, waLink } from "@/lib/site";
import { services } from "@/lib/services";
import { Icon } from "@/components/icons";
import {
  Badge,
  ErrorBox,
  Field,
  Loading,
  Modal,
  Select,
  StatusBadge,
  REQUEST_STATUS_LABEL,
  SOURCE_LABEL,
  fmtDateTime,
} from "@/components/panel/ui";

type RequestRow = {
  id: number;
  name: string;
  phone: string;
  placeType: string;
  systems: string[];
  note: string;
  source: string;
  status: string;
  assignedTo: number | null;
  assignedName: string | null;
  createdAt: string;
};

type StaffRow = { id: number; name: string; role: string };

const statuses = Object.keys(REQUEST_STATUS_LABEL);

export default function TaleplerPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [filter, setFilter] = useState(searchParams.get("status") ?? "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<RequestRow | null>(null);

  const load = useCallback(async () => {
    try {
      const [requests, staffList] = await Promise.all([
        api<RequestRow[]>(
          `/api/requests${filter && filter !== "all" ? `?status=${filter}` : ""}`
        ),
        api<StaffRow[]>("/api/staff"),
      ]);
      setRows(requests);
      setStaff(staffList.filter((s) => s.role === "admin" || s.role === "staff"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const changeStatus = async (id: number, status: string) => {
    try {
      await api(`/api/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const changeAssignee = async (id: number, assignedTo: number | null) => {
    try {
      await api(`/api/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ assignedTo }),
      });
      await load();
      if (detail?.id === id) setDetail({ ...detail, assignedTo });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const systemNames = (slugs: string[]) =>
    slugs
      .map((slug) => services.find((s) => s.slug === slug)?.name ?? slug)
      .join(", ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Keşif Talepleri
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kayıt · durum değiştirmek için seçin
          </p>
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-auto"
          aria-label="Durum filtresi"
        >
          <option value="all">Tüm durumlar</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {REQUEST_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-ink/70">Talep yok</p>
          <p className="mt-1 text-sm text-ink/50">
            Web'deki keşif formu dolduruldukça talepler buraya düşer.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Talep</th>
                  <th className="px-5 py-3.5">Mekân</th>
                  <th className="px-5 py-3.5">Sistemler</th>
                  <th className="px-5 py-3.5">Kaynak</th>
                  <th className="px-5 py-3.5">Atanan</th>
                  <th className="px-5 py-3.5">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    id={`talep-${r.id}`}
                    className="align-top transition-colors hover:bg-ink/2"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setDetail(r)}
                        className="text-left"
                      >
                        <p className="font-bold text-ink hover:text-brand">{r.name}</p>
                        <p className="text-xs text-ink/50">
                          #{r.id} · {fmtDateTime(r.createdAt)} · {r.phone || "-"}
                        </p>
                      </button>
                    </td>
                    <td className="px-5 py-4 text-ink/70">{r.placeType || "-"}</td>
                    <td className="max-w-[220px] px-5 py-4">
                      <p className="truncate text-ink/70">{systemNames(r.systems) || "-"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone="gray">{SOURCE_LABEL[r.source] ?? r.source}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={r.assignedTo ?? ""}
                        onChange={(e) =>
                          changeAssignee(r.id, e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-36 py-1.5 text-xs"
                        aria-label="Atanan personel"
                      >
                        <option value="">Atanmadı</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={r.status}
                        onChange={(e) => changeStatus(r.id, e.target.value)}
                        className="w-40 py-1.5 text-xs"
                        aria-label="Durum"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {REQUEST_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `#${detail.id} · ${detail.name}` : ""}
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} labels={REQUEST_STATUS_LABEL} />
              <Badge tone="gray">{SOURCE_LABEL[detail.source] ?? detail.source}</Badge>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-ink/45">Mekân</dt>
                <dd className="mt-0.5 text-ink/80">{detail.placeType || "Belirtilmedi"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Telefon</dt>
                <dd className="mt-0.5">
                  {detail.phone ? (
                    <a
                      href={`tel:+${detail.phone.replace(/\D/g, "")}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {detail.phone}
                    </a>
                  ) : (
                    "Belirtilmedi"
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">İlgilendiği sistemler</dt>
                <dd className="mt-0.5 text-ink/80">
                  {systemNames(detail.systems) || "Belirtilmedi"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-ink/45">Not</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-ink/80">
                  {detail.note || "Not yok"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink/45">Geliş tarihi</dt>
                <dd className="mt-0.5 text-ink/80">{fmtDateTime(detail.createdAt)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <Field label="Durum" className="w-44">
                <Select
                  value={detail.status}
                  onChange={(e) => changeStatus(detail.id, e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {REQUEST_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Atanan personel" className="w-44">
                <Select
                  value={detail.assignedTo ?? ""}
                  onChange={(e) =>
                    changeAssignee(detail.id, e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Atanmadı</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-ink/8 pt-4 sm:flex-row">
              <a
                href={waLink(
                  `Merhaba ${detail.name}, ${site.shortName} web sitesinden gelen keşif talebiniz hakkında görüşelim.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                WhatsApp'tan Yaz
              </a>
              {detail.phone && (
                <a
                  href={`tel:+${detail.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  Hemen Ara
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}