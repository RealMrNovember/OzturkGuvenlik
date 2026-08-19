ALTER TABLE "jobs" ADD COLUMN "items" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "cost_total" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "sale_total" numeric(12, 2) DEFAULT '0' NOT NULL;