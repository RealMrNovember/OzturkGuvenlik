export const PERMISSION_KEYS = [
  "view_costs",
  "manage_products",
  "delete_records",
  "manage_staff",
  "manage_settings",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  view_costs: "Alış fiyatı / maliyet / kâr marjı görebilir",
  manage_products: "Ürün kataloğunu yönetebilir (ekle/düzenle/sil)",
  delete_records: "Kayıt silebilir (müşteri, iş, teklif, fatura, servis, randevu, kasa)",
  manage_staff: "Personeli yönetebilir (ekle/düzenle/sil, izin onayı)",
  manage_settings: "Site ayarlarını ve hizmet videolarını düzenleyebilir",
};

type PermissionSession = { role: string; permissions?: string[] | null } | null | undefined;

/** role="admin" her zaman tam yetkilidir; staff için permissions dizisi kontrol edilir. */
export function hasPermission(session: PermissionSession, key: PermissionKey): boolean {
  if (!session) return false;
  if (session.role === "admin") return true;
  return (session.permissions ?? []).includes(key);
}
