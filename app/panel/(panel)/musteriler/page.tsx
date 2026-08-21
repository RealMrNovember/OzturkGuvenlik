"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/fetch";
import { usePanelCan } from "@/components/panel/PanelShell";
import { Icon } from "@/components/icons";
import { CustomSelect } from "@/components/panel/form";
import {
  Badge,
  Btn,
  EmptyState,
  ErrorBox,
  ExportCsvLink,
  Field,
  Input,
  Loading,
  Modal,
  Select,
  Textarea,
  SOURCE_LABEL,
  fmtDateTime,
} from "@/components/panel/ui";

type CustomerRow = {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  marketingConsent: boolean;
  placeType: string;
  address: string;
  note: string;
  source: string;
  createdAt: string;
};

const blank = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  marketingConsent: false,
  placeType: "",
  address: "",
  note: "",
  source: "panel",
};

// Contact Picker API — yalnızca Android Chrome/Edge'de desteklenir (HTTPS +
// kullanıcı jesti şart). Desteklenmeyen tarayıcılarda buton hiç gösterilmez
// (aşamalı iyileştirme) — desktop'ta herhangi bir hata/karışıklık oluşmaz.
// multiple:true ile işletim sisteminin kendi rehber arayüzünde birden fazla
// kişi işaretlenip tek seferde çekilebilir.
type PickedContact = { name?: string[]; tel?: string[]; email?: string[] };
declare global {
  interface Navigator {
    contacts?: {
      select: (properties: string[], options?: { multiple?: boolean }) => Promise<PickedContact[]>;
    };
  }
}

type BulkContact = { name: string; phone: string; email: string; include: boolean; alreadyExists: boolean };

/** Karşılaştırma için telefonu sadece rakamlara indirger, başındaki 90/0'ı atar. */
const normalizePhone = (p: string) => p.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");

export default function MusterilerPage() {
  const canDelete = usePanelCan("delete_records");
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm(blank);
    setCreating(true);
  };

  const openEdit = (row: CustomerRow) => {
    setForm({
      name: row.name,
      contactName: row.contactName ?? "",
      phone: row.phone,
      email: row.email ?? "",
      marketingConsent: row.marketingConsent ?? false,
      placeType: row.placeType,
      address: row.address,
      note: row.note,
      source: row.source,
    });
    setEditing(row);
  };

  const [contactPickerSupported, setContactPickerSupported] = useState(false);
  useEffect(() => {
    setContactPickerSupported(
      typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window
    );
  }, []);

  const [bulkPicked, setBulkPicked] = useState<BulkContact[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkNotice, setBulkNotice] = useState("");
  const vcardInputRef = useRef<HTMLInputElement>(null);

  /** Ham (isim, telefon) listesini inceleme-modalı satırlarına çevirir —
   * tekrarları eler, telefonu sistemde zaten kayıtlı olanları işaretsiz bırakır.
   * Hem Contact Picker (Android) hem .vcf yükleme (iPhone/herkes) bu ortak
   * mantığı kullanır. */
  const buildBulkList = (raw: { name: string; phone: string; email?: string }[]): BulkContact[] => {
    const existingPhones = new Set(rows.map((r) => normalizePhone(r.phone)).filter(Boolean));
    const seen = new Set<string>();
    return raw
      .map((c) => ({ name: c.name.trim(), phone: c.phone.trim(), email: (c.email ?? "").trim() }))
      .filter((c) => c.name)
      .filter((c) => {
        const key = normalizePhone(c.phone) || c.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((c) => {
        const alreadyExists = normalizePhone(c.phone) !== "" && existingPhones.has(normalizePhone(c.phone));
        // Rehberden gelen kişi isim-soyisim olarak eklenir (firma adı
        // kavramı yok) — Firma Adı alanına yazılır, kullanıcı isterse
        // sonradan düzenleyip gerçek firma adını girebilir (kullanıcı isteği).
        return { ...c, alreadyExists, include: !alreadyExists };
      });
  };

  const pickFromContacts = async () => {
    if (!navigator.contacts) return;
    try {
      const picked = await navigator.contacts.select(["name", "tel", "email"], { multiple: true });
      if (!picked || picked.length === 0) return;
      setBulkPicked(
        buildBulkList(
          picked.map((c) => ({ name: c.name?.[0] ?? "", phone: c.tel?.[0] ?? "", email: c.email?.[0] ?? "" }))
        )
      );
      setBulkNotice("");
      setError("");
    } catch {
      // Kullanıcı iptal etti ya da izin reddedildi — sessizce geç.
    }
  };

  /** iPhone/Safari Contact Picker API'yi hiç desteklemiyor (Apple kısıtı) —
   * yerine iOS'un "Kişi Kartını Paylaş" ile ürettiği .vcf dosyaları (tek ya
   * da "Tüm Kişileri Dışa Aktar" ile birden çok VCARD bloğu içerebilir)
   * yükletip aynı toplu-ekleme inceleme akışına bağlıyoruz — platform bağımsız.
   */
  const parseVCards = (text: string): { name: string; phone: string; email: string }[] =>
    text
      .split(/BEGIN:VCARD/i)
      .slice(1)
      .map((block) => {
        const fn = block.match(/^FN[^:]*:(.*)$/im)?.[1]?.trim() ?? "";
        const tel = block.match(/^TEL[^:]*:(.*)$/im)?.[1]?.trim() ?? "";
        const email = block.match(/^EMAIL[^:]*:(.*)$/im)?.[1]?.trim() ?? "";
        return { name: fn, phone: tel, email };
      });

  const handleVCardFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError("");
    try {
      const texts = await Promise.all(files.map((f) => f.text()));
      const parsed = texts.flatMap(parseVCards);
      if (parsed.length === 0) {
        setError("Dosyada okunabilir kişi bulunamadı (.vcf bekleniyor).");
        return;
      }
      setBulkPicked(buildBulkList(parsed));
      setBulkNotice("");
    } catch {
      setError("Kişi kartı dosyası okunamadı.");
    }
  };

  const toggleBulk = (idx: number) =>
    setBulkPicked((prev) => prev.map((c, i) => (i === idx ? { ...c, include: !c.include } : c)));

  const bulkSave = async () => {
    const toAdd = bulkPicked.filter((c) => c.include);
    if (toAdd.length === 0) {
      setBulkPicked([]);
      return;
    }
    setBulkSaving(true);
    setError("");
    let ok = 0;
    let fail = 0;
    for (const c of toAdd) {
      try {
        await api("/api/customers", {
          method: "POST",
          body: JSON.stringify({ name: c.name, phone: c.phone, email: c.email, source: "telefon" }),
        });
        ok++;
      } catch {
        fail++;
      }
    }
    setBulkSaving(false);
    setBulkPicked([]);
    await load();
    setBulkNotice(fail > 0 ? `${ok} müşteri eklendi, ${fail} tanesi eklenemedi.` : `${ok} müşteri eklendi.`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<CustomerRow[]>(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setRows(data);
      const editId = searchParams.get("edit");
      if (editId) {
        const target = data.find((c) => c.id === Number(editId));
        if (target) openEdit(target);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api(`/api/customers/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await api("/api/customers", { method: "POST", body: JSON.stringify(form) });
      }
      setCreating(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: CustomerRow) => {
    if (!confirm(`${row.name} silinsin mi? Bağlı talepler/randevular adres bilgisini kaybeder.`))
      return;
    try {
      await api(`/api/customers/${row.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Müşteriler</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} kayıt</p>
        </div>
        <div className="flex gap-2.5">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Firma, yetkili, telefon, e-posta, adres ara…"
              className="w-64 pl-10"
            />
          </div>
          {contactPickerSupported && (
            <Btn variant="ghost" onClick={pickFromContacts}>
              <Icon name="users" className="h-4 w-4" />
              Rehberden Toplu Ekle
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => vcardInputRef.current?.click()}>
            <Icon name="download" className="h-4 w-4 rotate-180" />
            Kişi Kartı Yükle
          </Btn>
          <input
            ref={vcardInputRef}
            type="file"
            accept=".vcf,text/vcard,text/x-vcard"
            multiple
            className="hidden"
            onChange={handleVCardFiles}
          />
          <ExportCsvLink href="/api/customers/export" />
          <ExportCsvLink href="/api/customers/export?consentOnly=1" label="Pazarlama İzinli Liste" />
          <Btn onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" />
            Yeni Müşteri
          </Btn>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      {bulkNotice && (
        <p className="rounded-xl bg-brand/5 px-4 py-3 text-sm text-ink/70">{bulkNotice}</p>
      )}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState
          title={q ? "Sonuç bulunamadı" : "Müşteri yok"}
          desc={q ? "Aramayı değiştirmeyi deneyin." : "Yeni müşteri ekleyerek başlayın."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-xs font-bold uppercase tracking-wider text-ink/45">
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">İletişim</th>
                  <th className="px-5 py-3.5">Mekân</th>
                  <th className="px-5 py-3.5">Kaynak</th>
                  <th className="px-5 py-3.5">Kayıt</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {rows.map((c) => (
                  <tr key={c.id} className="align-top hover:bg-ink/2">
                    <td className="px-5 py-4">
                      <Link href={`/panel/musteriler/${c.id}`} className="font-bold text-ink hover:text-brand">
                        {c.name}
                      </Link>
                      {c.contactName && (
                        <p className="mt-0.5 text-xs font-semibold text-ink/55">{c.contactName}</p>
                      )}
                      {c.address && (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-ink/45">
                          {c.address}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.phone ? (
                        <a
                          href={`tel:+${c.phone.replace(/\D/g, "")}`}
                          className="font-semibold text-brand hover:underline"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        <span className="text-ink/45">-</span>
                      )}
                      {c.email && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/45">
                          <a href={`mailto:${c.email}`} className="truncate hover:text-brand hover:underline">
                            {c.email}
                          </a>
                          {c.marketingConsent && <Badge tone="green">Pazarlama izni</Badge>}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink/70">{c.placeType || "-"}</td>
                    <td className="px-5 py-4">
                      <Badge tone="gray">{SOURCE_LABEL[c.source] ?? c.source}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink/55">
                      {fmtDateTime(c.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          aria-label="Düzenle"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/55 hover:bg-ink/5 hover:text-ink"
                        >
                          <Icon name="pen" className="h-4 w-4" />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => remove(c)}
                            aria-label="Sil"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500/70 hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <Modal
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          title={editing ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
          wide
        >
          <form onSubmit={save} className="space-y-4">
            {error && <ErrorBox message={error} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Firma Adı (bireysel müşteride ad soyad yazın)">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Örn: ABC Tekstil"
                />
              </Field>
              <Field label="Yetkili Ad Soyad (opsiyonel)">
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Örn: Ahmet Gedik"
                />
              </Field>
              <Field label="Telefon">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                />
              </Field>
              <Field label="E-posta">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ornek@firma.com"
                />
              </Field>
              <Field label="Mekân tipi">
                <CustomSelect
                  value={form.placeType}
                  onChange={(v) => setForm({ ...form, placeType: v })}
                  options={["İş yeri", "Site / Apartman", "Ev", "Depo / Fabrika", "Diğer"].map(
                    (v) => ({ value: v, label: v })
                  )}
                  placeholder="Seçin"
                />
              </Field>
              <Field label="Kaynak">
                <Select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                >
                  {Object.keys(SOURCE_LABEL).map((s) => (
                    <option key={s} value={s}>
                      {SOURCE_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Adres">
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </Field>
              </div>
              {form.email && (
                <div className="sm:col-span-2">
                  <label className="flex items-start gap-2.5 rounded-xl border border-ink/10 bg-surface px-3.5 py-3">
                    <input
                      type="checkbox"
                      checked={form.marketingConsent}
                      onChange={(e) => setForm({ ...form, marketingConsent: e.target.checked })}
                      className="mt-0.5 h-4 w-4 accent-brand"
                    />
                    <span className="text-sm text-ink">
                      <span className="font-semibold">Kampanya/pazarlama e-postası izni</span>
                      <span className="block text-xs text-ink/50">
                        Bu müşteri ticari elektronik ileti (kampanya, duyuru vb.) almayı kabul etti.
                        Yalnızca fatura/randevu gibi mevcut iş ilişkisi kapsamındaki e-postalar için
                        bu izin gerekmez — ileride kampanya göndermek isterseniz yalnızca bu kutusu
                        işaretli müşterilere gönderilir (KVKK/İYS gereği).
                      </span>
                    </span>
                  </label>
                </div>
              )}
              <div className="sm:col-span-2">
                <Field label="Not">
                  <Textarea
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              >
                Vazgeç
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {bulkPicked.length > 0 && (
        <Modal open onClose={() => setBulkPicked([])} title={`Rehberden Ekle (${bulkPicked.length} kişi)`} wide>
          <div className="space-y-4">
            <p className="text-sm text-ink/60">
              İşaretli kişiler isim soyisim olarak müşteri eklenir — firma adını sonradan
              düzenleyerek girebilirsiniz. Telefonu sistemde zaten kayıtlı olanların işareti
              otomatik kaldırıldı.
            </p>
            <div className="max-h-96 divide-y divide-ink/6 overflow-y-auto rounded-xl border border-ink/8">
              {bulkPicked.map((c, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink/2"
                >
                  <input
                    type="checkbox"
                    checked={c.include}
                    onChange={() => toggleBulk(idx)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                    <span className="block truncate text-xs text-ink/45">
                      {c.phone || "Telefon yok"}
                      {c.email && ` · ${c.email}`}
                    </span>
                  </span>
                  {c.alreadyExists && <Badge tone="amber">Zaten kayıtlı</Badge>}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-ink/8 pt-4">
              <Btn variant="ghost" onClick={() => setBulkPicked([])}>
                Vazgeç
              </Btn>
              <Btn onClick={bulkSave} disabled={bulkSaving || bulkPicked.every((c) => !c.include)}>
                {bulkSaving
                  ? "Ekleniyor…"
                  : `${bulkPicked.filter((c) => c.include).length} Kişiyi Ekle`}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}