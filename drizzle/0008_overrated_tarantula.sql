ALTER TABLE "site_settings" ADD COLUMN "hero_video_url" varchar(500) DEFAULT '';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_video_autoplay" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_video_muted" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_video_start" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "hero_video_duration" integer;