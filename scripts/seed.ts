import { db } from "../lib/db";
import { customers, serviceRequests, users, appointments, products } from "../lib/db/schema";
import { eq, count } from "drizzle-orm";
import { hashPassword } from "../lib/auth";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "yonetici@ozturkguvenlik.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Ozk4n!2026";

  // 1) Admin hesabı (idempotent)
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);
  let adminId: number;
  if (existing.length === 0) {
    const [admin] = await db
      .insert(users)
      .values({
        name: process.env.ADMIN_NAME ?? "Recep Özkan Öztürk",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE ?? "05350146593",
        role: "admin",
        specialty: "Kamera, Alarm, PDKS",
        passwordHash: await hashPassword(adminPassword),
        active: true,
      })
      .returning({ id: users.id });
    adminId = admin.id;
    console.log(`[seed] Admin oluşturuldu: ${adminEmail}`);
  } else {
    adminId = existing[0].id;
    console.log(`[seed] Admin zaten var: ${adminEmail} (şifre değiştirilmedi)`);
  }

  // 2) Örnek personel (yoksa)
  const staff: { name: string; email: string; phone: string; specialty: string }[] = [
    { name: "Ahmet Demir", email: "ahmet@ozturkguvenlik.com", phone: "05320001111", specialty: "Kamera, Network" },
    { name: "Murat Yılmaz", email: "murat@ozturkguvenlik.com", phone: "05320002222", specialty: "Alarm, Yangın" },
  ];
  const staffIds: number[] = [adminId];
  for (const s of staff) {
    const exists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, s.email))
      .limit(1);
    if (exists.length === 0) {
      const [row] = await db
        .insert(users)
        .values({
          ...s,
          role: "staff",
          passwordHash: await hashPassword("Personel.2026"),
          active: true,
        })
        .returning({ id: users.id });
      staffIds.push(row.id);
      console.log(`[seed] Personel oluşturuldu: ${s.name}`);
    } else {
      staffIds.push(exists[0].id);
    }
  }

  // 3) Ürün kataloğu başlangıç verisi (idempotent — sadece boşsa eklenir)
  const [productCount] = await db.select({ n: count() }).from(products);
  if (productCount.n === 0) {
    await db.insert(products).values([
      { name: "UNV 4MP IP Kamera", category: "Kamera", unit: "adet", costPrice: "1450", salePrice: "2200", stockQty: 24 },
      { name: "UNV 8 Kanal NVR", category: "Kayıt Cihazı", unit: "adet", costPrice: "3200", salePrice: "4800", stockQty: 5 },
      { name: "Seagate SkyHawk 2TB HDD", category: "Depolama", unit: "adet", costPrice: "1650", salePrice: "2400", stockQty: 12 },
      { name: "TP-Link 8 Port PoE Switch", category: "Network", unit: "adet", costPrice: "2100", salePrice: "3100", stockQty: 6 },
      { name: "ZKTeco Parmak İzi + Kart Okuyucu", category: "PDKS", unit: "adet", costPrice: "2800", salePrice: "4200", stockQty: 8 },
      { name: "Kamera Kablolama (CAT6 + Güç)", category: "Malzeme", unit: "metre", costPrice: "12", salePrice: "22", stockQty: 850 },
      { name: "Montaj İşçiliği", category: "Hizmet", unit: "hizmet", costPrice: "0", salePrice: "1500", stockQty: 0 },
    ]);
    console.log("[seed] Ürün kataloğu eklendi (7 kalem).");
  } else {
    console.log("[seed] Ürün kataloğu zaten var, atlanıyor.");
  }

  // 4) Örnek veriler (sadece veritabanı boşsa)
  const [reqCount] = await db.select({ n: count() }).from(serviceRequests);
  if (reqCount.n > 0) {
    console.log("[seed] Örnek veri eklenmedi (mevcut kayıtlar var).");
    return;
  }

  const [customer] = await db
    .insert(customers)
    .values({
      name: "Örnek Müşteri A.Ş.",
      phone: "05320003333",
      placeType: "İş yeri",
      address: "Yenibosna Merkez Mah. Kenanbey Sokak, Bahçelievler/İstanbul",
      note: "Seed verisi — paneli denemek için.",
      source: "referans",
    })
    .returning({ id: customers.id, name: customers.name, phone: customers.phone, address: customers.address });

  const [request] = await db
    .insert(serviceRequests)
    .values({
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      placeType: "İş yeri",
      systems: ["kamera-sistemleri", "pdks"],
      note: "2 katlı ofis, 8 kamera + parmak izi okuyucu.",
      source: "web",
      status: "yeni",
      assignedTo: adminId,
    })
    .returning({ id: serviceRequests.id });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db.insert(appointments).values({
    customerId: customer.id,
    requestId: request.id,
    title: "Keşif randevusu — Örnek Müşteri A.Ş.",
    date: tomorrow.toISOString().slice(0, 10),
    time: "10:30",
    address: customer.address,
    note: "Keşif sonrası teklif hazırlanacak.",
    status: "planlandi",
    assignedTo: adminId,
  });

  console.log("[seed] Örnek veriler eklendi (müşteri, talep, randevu).");
  console.log("");
  console.log("Giriş bilgileri:");
  console.log(`  Admin  : ${adminEmail} / ${adminPassword}`);
  console.log(`  Personel: ahmet@ozturkguvenlik.com / Personel.2026`);
  console.log("İlk girişten sonra şifrelerinizi panel üzerinden değiştirin.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] Hata:", err);
    process.exit(1);
  });