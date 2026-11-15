ALTER TABLE "service_media" ADD COLUMN "hero_size" varchar(20) DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_videos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_size" varchar(20) DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_ads_conversion_id" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "google_ads_conversion_label" varchar(60) DEFAULT '';