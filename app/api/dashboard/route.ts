import { db } from "@/lib/db";
import {
  appointments,
  jobs,
  serviceRequests,
  serviceTickets,
  users,
  customers,
  offers,
  invoices,
  transactions,
  products,
  maintenanceContracts,
  suppliers,
  supplierInvoices,
  LOW_STOCK_THRESHOLD,
} from "@/lib/db/schema";
import { and, asc, desc, eq, gte, inArray, lte, ne } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const monthFromNow = new Date(Date.now() + 30 * 24 * 3600 * 1000)
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
    lowStockProducts,
    openTickets,
    unpaidSupplierInvoices,
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
        currency: invoices.currency,
        exchangeRate: invoices.exchangeRate,
        dueDate: invoices.dueDate,
        customerName: customers.name,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(inArray(invoices.status, ["taslak", "gonderildi"])),
    db
      .select({ type: transactions.type, amount: transactions.amount, exchangeRate: transactions.exchangeRate })
      .from(transactions)
      .where(gte(transactions.date, monthStart)),
    db
      .select({ id: products.id, name: products.name, stockQty: products.stockQty })
      .from(products)
      .where(and(lte(products.stockQty, LOW_STOCK_THRESHOLD), eq(products.active, true))),
    db
      .select({ id: serviceTickets.id })
      .from(serviceTickets)
      .where(inArray(serviceTickets.status, ["acik", "randevu-verildi"])),
    db
      .select({
        id: supplierInvoices.id,
        amount: supplierInvoices.amount,
        currency: supplierInvoices.currency,
        exchangeRate: supplierInvoices.exchangeRate,
        dueDate: supplierInvoices.dueDate,
        supplierName: suppliers.name,
      })
      .from(supplierInvoices)
      .leftJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
      .where(ne(supplierInvoices.status, "odendi")),
  ]);

  // Ay içi gelir/gider toplamları her zaman ₺ cinsinden: yabancı para birimindeki
  // işlemler, kayıt anında kilitlenmiş kurlarıyla ₺'ye çevrilerek toplanır.
  const monthIncome = monthTransactions
    .filter((t) => t.type === "gelir")
    .reduce((s, t) => s + Number(t.amount) * Number(t.exchangeRate), 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === "gider")
    .reduce((s, t) => s + Number(t.amount) * Number(t.exchangeRate), 0);

  const overdueInvoices = pendingInvoices.filter((i) => i.dueDate && i.dueDate < today);
  const payablesTotal = unpaidSupplierInvoices.reduce(
    (s, i) => s + Number(i.amount) * Number(i.exchangeRate),
    0
  );
  const overdueSupplierInvoices = unpaidSupplierInvoices.filter((i) => i.dueDate && i.dueDate < today);

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

  const upcomingMaintenance = await db
    .select({
      id: maintenanceContracts.id,
      type: maintenanceContracts.type,
      nextServiceDate: maintenanceContracts.nextServiceDate,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(maintenanceContracts)
    .leftJoin(customers, eq(maintenanceContracts.customerId, customers.id))
    .where(and(eq(maintenanceContracts.active, true), lte(maintenanceContracts.nextServiceDate, monthFromNow)))
    .orderBy(asc(maintenanceContracts.nextServiceDate))
    .limit(10);

  return jsonOk({
    counts: {
      newRequests: newRequests.length,
      awaitingCalls: awaitingCalls.length,
      openJobs: openJobs.length,
      todayAppointments: todayAppointments.length,
      pendingOffers: pendingOffers.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      lowStockProducts: lowStockProducts.length,
      openTickets: openTickets.length,
      upcomingMaintenance: upcomingMaintenance.length,
      overdueSupplierInvoices: overdueSupplierInvoices.length,
    },
    lowStockProducts,
    upcomingMaintenance,
    finance: {
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
      payablesTotal,
    },
    pendingInvoices: pendingInvoices
      .map((i) => ({ ...i, overdue: !!i.dueDate && i.dueDate < today }))
      .sort((a, b) => Number(b.overdue) - Number(a.overdue))
      .slice(0, 6),
    overdueSupplierInvoices: overdueSupplierInvoices.slice(0, 6),
    recentRequests,
    todayAppointments,
    upcomingAppointments,
  });
}
