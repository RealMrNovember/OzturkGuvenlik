import { Resend } from "resend";
import { getResolvedSite } from "@/lib/site-settings";

// RESEND_API_KEY Vercel ortam değişkenlerinde ayarlanmalı (resend.com'dan
// alınır) — kod sohbete/repoya asla yapıştırılmaz. Anahtar yoksa bildirimler
// sessizce atlanır (uygulama e-posta olmadan da tam çalışır) — sadece uyarı
// loglanır, hiçbir istek bu yüzden 500 dönmez.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Kendi alan adı Resend'de doğrulanana kadar varsayılan gönderen budur —
// Resend'in sahiplik doğrulaması gerektirmeyen test alan adı. Doğrulama
// sonrası EMAIL_FROM ortam değişkeniyle "bildirim@öztürkgüvenlik.com" gibi
// gerçek bir adrese geçilebilir.
const FROM = process.env.EMAIL_FROM || "Öztürk Güvenlik <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY ayarlı değil — bildirim gönderilmedi: "${subject}" → ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Bildirim gönterimi asla ana işlemi (talep kaydı, cron vb.) düşürmemeli.
    console.error("[email] Gönderim başarısız:", err);
  }
}

export async function emailLayout(title: string, bodyHtml: string): Promise<string> {
  const site = await getResolvedSite();
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #0e6fb8; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <span style="color: #fff; font-size: 18px; font-weight: 700;">${site.shortName}</span>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
        <h1 style="font-size: 18px; margin: 0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <p style="font-size: 12px; color: #888; margin-top: 16px; text-align: center;">
        ${site.shortName} · ${site.phoneDisplay} · ${site.email}
      </p>
    </div>
  `;
}
