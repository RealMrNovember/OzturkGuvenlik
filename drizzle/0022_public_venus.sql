ALTER TABLE "jobs" ADD COLUMN "photos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "photos" jsonb DEFAULT '[]'::jsonb NOT NULL;