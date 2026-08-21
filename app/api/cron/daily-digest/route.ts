import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments, customers, maintenanceContracts } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";
import { sendEmail, emailLayout } from "@/lib/email";
import { getResolvedSite } from "@/lib/site-settings";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Vercel Cron ile günde bir sabah çağrılır (bkz. vercel.json) — yarının
// randevularını ve yaklaşan/gecikmiş bakım sözleşmelerini tek bir özet
// e-postasında toplar. Personelin/müşterinin e-postası şu an sistemde
// tutulmadığı için (customers tablosunda e-posta alanı yok) alıcı site
// yönetim adresidir; personel bunu görüp kendi takvimini kontrol eder.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return jsonErr("Yetkisiz", 401);
  }

  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const weekAhead = addDays(today, 7);

  const tomorrowAppointments = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      time: appointments.time,
      address: appointments.address,
      customerName: customers.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .where(and(eq(appointments.date, tomorrow), eq(appointments.status, "planlandi")));

  const dueMaintenance = await db
    .select({
      id: maintenanceContracts.id,
      type: maintenanceContracts.type,
      nextServiceDate: maintenanceContracts.nextServiceDate,
      customerName: customers.name,
    })
    .from(maintenanceContracts)
    .leftJoin(customers, eq(maintenanceContracts.customerId, customers.id))
    .where(and(eq(maintenanceContracts.active, true), lte(maintenanceContracts.nextServiceDate, weekAhead)));

  if (tomorrowAppointments.length === 0 && dueMaintenance.length === 0) {
    return jsonOk({ sent: false, reason: "Bildirilecek randevu/bakım yok" });
  }

  const appointmentsHtml =
    tomorrowAppointments.length > 0
      ? `
        <h2 style="font-size: 14px; margin: 20px 0 8px;">Yarının randevuları (${fmtDate(tomorrow)})</h2>
        <ul style="margin: 0; padding-left: 18px;">
          ${tomorrowAppointments
            .map(
              (a) =>
                `<li style="margin-bottom: 6px;">${a.time} — ${a.customerName ?? "Müşteri"} ${a.title ? `(${a.title})` : ""} ${a.address ? `· ${a.address}` : ""}</li>`
            )
            .join("")}
        </ul>
      `
      : "";

  const maintenanceHtml =
    dueMaintenance.length > 0
      ? `
        <h2 style="font-size: 14px; margin: 20px 0 8px;">Yaklaşan/gecikmiş bakımlar (önümüzdeki 7 gün)</h2>
        <ul style="margin: 0; padding-left: 18px;">
          ${dueMaintenance
            .map((m) => {
              const overdue = m.nextServiceDate < today;
              return `<li style="margin-bottom: 6px; ${overdue ? "color: #d32f2f;" : ""}">${m.customerName ?? "Müşteri"} — ${m.type || "Bakım"} — ${fmtDate(m.nextServiceDate)}${overdue ? " (GECİKTİ)" : ""}</li>`;
            })
            .join("")}
        </ul>
      `
      : "";

  const site = await getResolvedSite();
  await sendEmail(
    site.email,
    `Günlük özet — ${tomorrowAppointments.length} randevu, ${dueMaintenance.length} bakım`,
    await emailLayout(
      "Günlük Özet",
      `
        ${appointmentsHtml}
        ${maintenanceHtml}
        <p style="margin: 20px 0 0;">
          <a href="${site.url}/panel" style="color: #0e6fb8;">Panele git →</a>
        </p>
      `
    )
  );

  return jsonOk({ sent: true, appointments: tomorrowAppointments.length, maintenance: dueMaintenance.length });
}
