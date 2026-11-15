ALTER TABLE "service_media" ADD COLUMN "card_title" varchar(120) DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_media" ADD COLUMN "card_description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_media" ADD COLUMN "card_image_url" text;--> statement-breakpoint
ALTER TABLE "service_media" ADD COLUMN "card_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "service_media" ADD COLUMN "card_sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "youtube_url" varchar(300) DEFAULT '';