import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { buildGibBookmarkletHref } from "@/lib/gib-bookmarklet";
import { gibImportToken } from "@/lib/gib-import";

/** Bookmarklet linkleri site sırrını (token) içerdiği için oturum + yetki arkasında kalır. */
export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  if (!gibImportToken()) {
    return jsonErr("GİB aktarım jetonu henüz tanımlanmadı — GIB_IMPORT_TOKEN ortam değişkenini ayarlayın.", 503);
  }

  return jsonOk({
    gelen: buildGibBookmarkletHref("gelen"),
    giden: buildGibBookmarkletHref("giden"),
  });
}
