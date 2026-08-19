import { db } from "@/lib/db";
import {
  appointments,
  jobs,
  serviceRequests,
  users,
  customers,
  offers,
  invoices,
  transactions,
} from "@/lib/db/schema";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    newRequests,
    awaitingCalls,
    openJobs,
    pendingOffers,
    pendingInvoices,
    monthTransactions,
  ] = await Promise.all([
    db.select({ id: serviceRequests.id }).from(serviceRequests).where(eq(serviceRequests.status, "yeni")),
    db.select({ id: serviceRequests.id }).from(serviceRequests).where(eq(serviceRequests.status, "aranacak")),
    db
      .select({ id: jobs.id })
      .from(jobs)
      .where(inArray(jobs.status, ["planlandi", "devam-ediyor"])),
    db
      .select({ id: offers.id })
      .from(offers)
      .where(inArray(offers.status, ["tasarim", "gonderildi"])),
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        total: invoices.total,
        dueDate: invoices.dueDate,
        customerName: customers.name,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(inArray(invoices.status, ["taslak", "gonderildi"])),
    db
      .select({ type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .where(gte(transactions.date, monthStart)),
  ]);

  const monthIncome = monthTransactions
    .filter((t) => t.type === "gelir")
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === "gider")
    .reduce((s, t) => s + Number(t.amount), 0);

  const recentRequests = await db
    .select({
      id: serviceRequests.id,
      name: serviceRequests.name,
      phone: serviceRequests.phone,
      placeType: serviceRequests.placeType,
      systems: serviceRequests.systems,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
    })
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(5);

  const todayAppointments = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      assignedName: users.name,
      customerName: customers.name,
    })
    .from(appointments)
    .leftJoin(users, eq(appointments.assignedTo, users.id))
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .where(eq(appointments.date, today))
    .orderBy(desc(appointments.time));

  const upcomingAppointments = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      assignedName: users.name,
      customerName: customers.name,
    })
    .from(appointments)
    .leftJoin(users, eq(appointments.assignedTo, users.id))
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .where(
      and(
        gte(appointments.date, today),
        lte(appointments.date, weekFromNow),
        eq(appointments.status, "planlandi")
      )
    )
    .orderBy(desc(appointments.date))
    .limit(8);

  return jsonOk({
    counts: {
      newRequests: newRequests.length,
      awaitingCalls: awaitingCalls.length,
      openJobs: openJobs.length,
      todayAppointments: todayAppointments.length,
      pendingOffers: pendingOffers.length,
      pendingInvoices: pendingInvoices.length,
    },
    finance: {
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
    },
    pendingInvoices: pendingInvoices.slice(0, 6),
    recentRequests,
    todayAppointments,
    upcomingAppointments,
  });
}
