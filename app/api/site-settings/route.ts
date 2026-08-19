import { revalidatePath } from "next/cache";
import { updateSiteSettingsSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  return jsonOk(await getSiteSettings());
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = updateSiteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const updated = await updateSiteSettings(parsed.data, session.id);
  revalidatePath("/", "layout");
  return jsonOk(updated);
}
