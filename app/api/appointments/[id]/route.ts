import { db } from "@/lib/db";
import { appointments, serviceTickets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateAppointmentSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

/**
 * "Servis-Arıza" türündeki bir randevu "tamamlandı" durumuna geçince,
 * teknisyenin ayrıca panelde yeni servis kaydı açmasına gerek kalmadan
 * otomatik bir taslak servis kaydı oluşturur — kalan alanlar (result,
 * kullanılan parça vb.) teknisyen tarafından doldurulur. Sessizce
 * atlanır: zaten bu randevuya bağlı bir kayıt varsa (tekrar tetiklenme)
 * veya oluşturma başarısız olursa — randevu güncellemesinin kendisini
 * asla düşürmemeli.
 */
async function maybeCreateServiceTicket(
  before: { status: string } | undefined,
  after: typeof appointments.$inferSelect
): Promise<void> {
  if (after.type !== "servis-ariza" || after.status !== "tamamlandi") return;
  if (before?.status === "tamamlandi") return; // zaten tamamlanmıştı, tekrar tetikleme

  try {
    const [existing] = await db
      .select({ id: serviceTickets.id })
      .from(serviceTickets)
      .where(eq(serviceTickets.appointmentId, after.id))
      .limit(1);
    if (existing) return;

    await db.insert(serviceTickets).values({
      customerId: after.customerId,
      appointmentId: after.id,
      location: after.address ?? "",
      issue:
        after.note?.trim() ||
        after.title?.trim() ||
        "Servis/arıza randevusu tamamlandı — detaylar panelden girilmeli.",
      status: "acik",
      assignedTo: after.assignedTo,
      requestType: "servis",
    });
  } catch (err) {
    console.error("[appointments] Otomatik servis kaydı oluşturulamadı:", err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [before] = await db
    .select({ status: appointments.status })
    .from(appointments)
    .where(eq(appointments.id, numericId))
    .limit(1);

  const [updated] = await db
    .update(appointments)
    .set(parsed.data)
    .where(eq(appointments.id, numericId))
    .returning();
  if (!updated) return jsonErr("Randevu bulunamadı", 404);

  await maybeCreateServiceTicket(before, updated);

  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "delete_records")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [deleted] = await db
    .delete(appointments)
    .where(eq(appointments.id, numericId))
    .returning({ id: appointments.id });
  if (!deleted) return jsonErr("Randevu bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}