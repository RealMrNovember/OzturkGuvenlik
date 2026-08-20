import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { listServiceMedia } from "@/lib/service-media";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  return jsonOk(await listServiceMedia());
}
