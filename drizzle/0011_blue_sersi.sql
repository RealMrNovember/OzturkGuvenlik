CREATE TABLE "service_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_slug" varchar(60) NOT NULL,
	"video_url" varchar(500) DEFAULT '',
	"video_autoplay" boolean DEFAULT true NOT NULL,
	"video_muted" boolean DEFAULT true NOT NULL,
	"video_start" integer DEFAULT 0 NOT NULL,
	"video_duration" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "service_media_service_slug_unique" UNIQUE("service_slug")
);
--> statement-breakpoint
ALTER TABLE "service_media" ADD CONSTRAINT "service_media_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;