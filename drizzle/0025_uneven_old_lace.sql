CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"review_text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"review_date" date NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
INSERT INTO "reviews" ("name", "review_text", "rating", "review_date", "published", "sort_order") VALUES
('Furkan Pamuk', 'Kentsel dönüşüm kapsamında yaptırdığımız yeni binamıza kamera sistemi kurulumu için Öztürk Güvenlik ile çalıştık ve gerçekten çok memnun kaldık. Hem keşif sürecinde hem montaj aşamasında son derece ilgili ve profesyonel davrandılar. Kullanılan ekipmanlar kaliteli, görüntü netliği çok iyi. Kurulum hızlı ve temiz şekilde yapıldı. Gönül rahatlığıyla tavsiye ederim. Özkan beye teşekkürler.', 5, '2026-04-21', true, 0),
('Abdulsamed Çolak', 'Instagramdan denk gelip aradık, gün içinde ücretsiz keşif yapıp 3 gün içinde montajımızı tamamlayıp teslim ettiler. Gerçekten işlerini başarıyla, titizlikle yapan bir firma. Keşif için sadece araştırma aşamasındaydım, gelen Özkan Bey ihtiyacım olduğunu hissettirdi, gerçekten de öyleymiş. Emeğine sağlık.', 5, '2026-04-21', true, 1),
('Muhammed', 'Öztürk Güvenlik Kamera firmasıyla çalışmaktan memnun kaldık. Kurulum hızlı ve sorunsuzdu, ekip hem ilgili hem de işinde profesyoneldi. İletişimleri samimi, hizmetleri güven verici. Tavsiye ederim.', 5, '2026-04-21', true, 2),
('Halil Güler', 'Öztürk Kamera Güvenlik Sistemlerinden hizmet aldım, işlerini temiz ve düzgün yapıyorlar. Kurulum hızlı oldu, kameraların görüntü kalitesi iyi. Sorularımda da yardımcı oldular, memnun kaldım. Tavsiye ederim.', 5, '2025-12-21', true, 3),
('Berat Kaya', 'Ofisimize parmak okuyucu sistemi taktırdım, personel takibim çok kolaylaştı. Çalışma saatine göre ücret takibi dahi yaptırabiliyorum. Özkan beye teşekkürler.', 5, '2024-08-21', true, 4);