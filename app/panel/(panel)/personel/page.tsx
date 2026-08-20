"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/fetch";
import { usePanelRole, usePanelSession } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import {
  Badge,
  Btn,
  EmptyState,
  ErrorBox,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  fmtDateTime,
} from "@/components/panel/ui";

type StaffRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialty: string;
  active: boolean;
  createdAt: string;
};

const blank = {
  name: "",
  email: "",
  phone: "",
  role: "staff",
  specialty: "",
  password: "",
  active: true,
};

const editBlank = {
  name: "",
  phone: "",
  specialty: "",
  role: "staff",
  active: true,
  newPassword: "",
};

export default function PersonelPage() {
  const role = usePanelRole();
  const sessionId = usePanelSession().id;
  const isAdmin = role === "admin";

  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [form, setForm] = useState(blank);
  const [editForm, setEditForm] = useState(editBlank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await api<StaffRow[]>("/api/staff"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
  };

  const openEdit = (row: StaffRow) => {
    setEditForm({
      name: row.name,
      phone: row.phone,
      specialty: row.specialty,
      role: row.role,
      active: row.active,
      newPassword: "",
    });
    setEditing(row);
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/api/staff", { method: "POST", body: JSON.stringify(form) });
      setCreating(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const payload: Record<string, unknown> = {
      name: editForm.name,
      phone: editForm.phone,
      specialty: editForm.specialty,
      active: editForm.active,
    };
    if (isAdmin) payload.role = editForm.role;
    if (editForm.newPassword) payload.newPassword = editForm.newPassword;
    try {
      await api(`/api/staff/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: StaffRow) => {
    if (!confirm(`${row.name} silinsin mi? Bu kişinin atandığı iş kayıtları bağsız kalır.`))
      return;
    try {
      await api(`/api/staff/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const canEdit = (row: StaffRow) => isAdmin || row.id === sessionId;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Personel</h1>
          <p className="mt-1 text-sm text-ink/55">
            {rows.length} kişi · panel girişi olan ekip
          </p>
        </div>
        {isAdmin && (
          <Btn onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            Yeni Personel
          </Btn>
        )}
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="Personel yok" desc="Yeni personel ekleyerek başlayın." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => {
            const lastAdmin =
              isAdmin && p.role === "admin" && rows.filter((r) => r.role === "admin").length === 1;
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${
                        p.role === "admin" ? "bg-brand" : "bg-ink/60"
                      }`}
                    >
                      {p.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w.charAt(0))
                        .join("")}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-ink/50">{p.email}</p>
                    </div>
                  </div>
                  {!p.active && <Badge tone="gray">Pasif</Badge>}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <Badge tone={p.role === "admin" ? "brand" : "gray"}>
                    {p.role === "admin" ? "Yönetici" : "Personel"}
                  </Badge>
                  {p.specialty && <Badge tone="violet">{p.specialty}</Badge>}
                  {p.phone && <span className="text-ink/55">{p.phone}</span>}
                </div>

                <p className="mt-3 text-xs text-ink/45">
                  Kayıt: {fmtDateTime(p.createdAt)}
                </p>

                <div className="mt-4 flex gap-2 border-t border-ink/8 pt-3">
                  {isAdmin && (
                    <Link
                      href={`/panel/personel/${p.id}`}
                      className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-center text-xs font-semibold text-ink transition-colors hover:border-ink/40"
                    >
                      Detay
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    disabled={!canEdit(p)}
                    className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Düzenle
                  </button>
                  {isAdmin && !lastAdmin && (
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      aria-label="Sil"
                      className="flex items-center justify-center rounded-full border border-red-200 px-3 py-2 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <Modal open onClose={() => setCreating(false)} title="Yeni Personel" wide>
          <form onSubmit={create} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="E-posta (giriş için)">
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Telefon">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Uzmanlık alanları">
                <Input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="Kamera, Alarm, PDKS…"
                />
              </Field>
              <Field label="Rol">
                <Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="staff">Personel</option>
                  <option value="admin">Yönetici</option>
                </Select>
              </Field>
              <Field label="Açılış şifresi">
                <Input
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="En az 6 karakter"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setCreating(false)}>
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Oluşturuluyor…" : "Oluştur"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)} title={`Düzenle — ${editing.name}`} wide>
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad">
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Field>
              <Field label="Telefon">
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Field>
              <Field label="Uzmanlık alanları">
                <Input
                  value={editForm.specialty}
                  onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                />
              </Field>
              {isAdmin && (
                <Field label="Rol">
                  <Select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="staff">Personel</option>
                    <option value="admin">Yönetici</option>
                  </Select>
                </Field>
              )}
              <Field label="Durum">
                <Select
                  value={editForm.active ? "1" : "0"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, active: e.target.value === "1" })
                  }
                >
                  <option value="1">Aktif (giriş yapabilir)</option>
                  <option value="0">Pasif (giriş engelli)</option>
                </Select>
              </Field>
              <Field label="Yeni şifre (değiştirmek için)">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="Boş bırakılırsa değişmez"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setEditing(null)}>
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