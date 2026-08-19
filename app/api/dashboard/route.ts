import { db } from "@/lib/db";
import {
  appointments,
  jobs,
  serviceRequests,
  users,
  customers,
} from "@/lib/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  const [newRequests, awaitingCalls, activeJobs] = await Promise.all([
    db
      .select({ id: serviceRequests.id })
      .from(serviceRequests)
      .where(eq(serviceRequests.status, "yeni")),
    db
      .select({ id: serviceRequests.id })
      .from(serviceRequests)
      .where(eq(serviceRequests.status, "aranacak")),
    db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.status, "devam-ediyor")),
  ]);

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
      activeJobs: activeJobs.length,
    },
    recentRequests,
    todayAppointments,
    upcomingAppointments,
  });
}