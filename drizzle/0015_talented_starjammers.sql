ALTER TABLE "supplier_invoices" ADD COLUMN "items" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD COLUMN "tax_rate" numeric(5, 2) DEFAULT '20' NOT NULL;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD COLUMN "received" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "supplier_invoices" ADD COLUMN "received_at" date;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "tax_office" varchar(100) DEFAULT '';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "tax_number" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "payment_term_days" integer;