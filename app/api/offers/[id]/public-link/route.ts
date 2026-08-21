import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { site } from "@/lib/site";

type Ctx = { params: Promise<{ id: string }> };

/** Get-or-create: bağlantı zaten üretilmişse aynısını döner — her tıklamada
 * yeni bir token üretilseydi önceden paylaşılmış linkler kırılırdı. */
export async function POST(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [existing] = await db
    .select({ id: offers.id, publicToken: offers.publicToken })
    .from(offers)
    .where(eq(offers.id, numericId))
    .limit(1);
  if (!existing) return jsonErr("Teklif bulunamadı", 404);

  let token = existing.publicToken;
  if (!token) {
    token = randomBytes(24).toString("hex");
    await db.update(offers).set({ publicToken: token }).where(eq(offers.id, numericId));
  }

  return jsonOk({ url: `${site.url}/teklif/${token}` });
}
