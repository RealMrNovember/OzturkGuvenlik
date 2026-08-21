"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import {
  Badge,
  Btn,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  Textarea,
} from "@/components/panel/ui";

type ReviewRow = {
  id: number;
  name: string;
  reviewText: string;
  rating: number;
  reviewDate: string;
  published: boolean;
  sortOrder: number;
};

const EMPTY_FORM = {
  name: "",
  reviewText: "",
  rating: "5",
  reviewDate: new Date().toISOString().slice(0, 10),
  published: true,
  sortOrder: 0,
};

export default function YorumlarPage() {
  const isAdmin = usePanelCan("manage_settings");

  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(() => isAdmin);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null | "new">(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      const data = await api<ReviewRow[]>("/api/reviews");
      setRows(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [isAdmin, load]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, sortOrder: rows.length });
    setError("");
    setEditingId("new");
  };

  const openEdit = (row: ReviewRow) => {
    setForm({
      name: row.name,
      reviewText: row.reviewText,
      rating: String(row.rating),
      reviewDate: row.reviewDate,
      published: row.published,
      sortOrder: row.sortOrder,
    });
    setError("");
    setEditingId(row.id);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        reviewText: form.reviewText.trim(),
        rating: Number(form.rating),
        reviewDate: form.reviewDate,
        published: form.published,
        sortOrder: form.sortOrder,
      };
      if (editingId === "new") {
        await api("/api/reviews", { method: "POST", body: JSON.stringify(payload) });
      } else if (editingId !== null) {
        await api(`/api/reviews/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      setEditingId(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (row: ReviewRow) => {
    try {
      await api(`/api/reviews/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !row.published }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (row: ReviewRow) => {
    if (!confirm(`"${row.name}" adlı yorumu silmek istediğinize emin misiniz?`)) return;
    try {
      await api(`/api/reviews/${row.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const move = async (row: ReviewRow, direction: -1 | 1) => {
    const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((r) => r.id === row.id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        api(`/api/reviews/${row.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: swapWith.sortOrder }) }),
        api(`/api/reviews/${swapWith.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: row.sortOrder }) }),
      ]);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink/60">
          Bu sayfayı görüntüleme yetkiniz yok. Müşteri yorumlarını yalnızca yöneticiler yönetebilir.
        </p>
      </div>
    );
  }

  if (loading) return <Loading />;

  const sortedRows = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Müşteri Yorumları</h1>
          <p className="mt-1 text-sm text-ink/55">
            Anasayfa ve Referanslarımız sayfasında gösterilen müşteri yorumlarını buradan
            ekleyip/düzenleyebilir, sıralayabilir ve yayından kaldırabilirsiniz.
          </p>
        </div>
        <Btn onClick={openNew}>
          <Icon name="plus" className="h-4 w-4" />
          Yeni Yorum
        </Btn>
      </div>

      {error && !editingId && <ErrorBox message={error} />}

      {sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-10 text-center text-sm text-ink/50">
          Henüz yorum eklenmedi.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="divide-y divide-ink/6">
            {sortedRows.map((row, i) => (
              <div key={row.id} className="flex items-start gap-3 px-5 py-4">
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => move(row, -1)}
                    disabled={i === 0}
                    aria-label="Yukarı taşı"
                    className="flex h-5 w-5 items-center justify-center rounded text-ink/40 hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow" className="h-3 w-3 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(row, 1)}
                    disabled={i === sortedRows.length - 1}
                    aria-label="Aşağı taşı"
                    className="flex h-5 w-5 items-center justify-center rounded text-ink/40 hover:bg-ink/5 hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow" className="h-3 w-3 rotate-90" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{row.name}</p>
                    <div className="flex items-center gap-0.5 text-[#F5A623]">
                      {Array.from({ length: row.rating }).map((_, j) => (
                        <Icon key={j} name="star" className="h-3.5 w-3.5" />
                      ))}
                    </div>
                    <Badge tone={row.published ? "green" : "gray"}>
                      {row.published ? "Yayında" : "Gizli"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink/60">{row.reviewText}</p>
                  <p className="mt-1 text-xs text-ink/40">{row.reviewDate}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePublished(row)}
                    aria-label={row.published ? "Yayından kaldır" : "Yayınla"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                  >
                    <Icon name="eye" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    aria-label="Düzenle"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                  >
                    <Icon name="pen" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    aria-label="Sil"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingId !== null && (
        <Modal
          open
          onClose={() => setEditingId(null)}
          title={editingId === "new" ? "Yeni Yorum" : "Yorumu Düzenle"}
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <Field label="Müşteri adı">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Örn: Furkan Pamuk"
                required
              />
            </Field>
            <Field label="Yorum metni">
              <Textarea
                rows={4}
                value={form.reviewText}
                onChange={(e) => setForm((f) => ({ ...f, reviewText: e.target.value }))}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Puan">
                <Select
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} yıldız
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tarih">
                <Input
                  type="date"
                  value={form.reviewDate}
                  onChange={(e) => setForm((f) => ({ ...f, reviewDate: e.target.value }))}
                  required
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="h-4 w-4 accent-brand"
              />
              Sitede yayında
            </label>

            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setEditingId(null)}>
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
