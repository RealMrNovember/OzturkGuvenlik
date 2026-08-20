import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { listServiceMedia } from "@/lib/service-media";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  return jsonOk(await listServiceMedia());
}
