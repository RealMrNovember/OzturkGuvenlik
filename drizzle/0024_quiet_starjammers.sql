ALTER TABLE "site_settings" ADD COLUMN "phones" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar(190) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "address" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "map_link" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "map_embed_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "instagram_url" varchar(300) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "facebook_url" varchar(300) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whatsapp_number" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whatsapp_default_text" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_rating" varchar(10) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_review_count" integer;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_reviews_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_analytics_id" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_site_verification" varchar(100) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "seo_title" varchar(200) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "seo_description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "seo_keywords" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "og_image_url" text DEFAULT '';