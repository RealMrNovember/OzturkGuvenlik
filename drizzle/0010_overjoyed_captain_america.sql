ALTER TABLE "invoices" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "currency" varchar(3) DEFAULT 'TRY' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "exchange_rate" numeric(14, 6) DEFAULT '1' NOT NULL;