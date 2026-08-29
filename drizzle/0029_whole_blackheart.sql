CREATE TABLE "gib_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"direction" varchar(10) NOT NULL,
	"ettn" varchar(64),
	"invoice_number" varchar(60) NOT NULL,
	"issue_date" date NOT NULL,
	"counterparty_name" varchar(200) DEFAULT '',
	"counterparty_tax_id" varchar(20) DEFAULT '',
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'TRY' NOT NULL,
	"gib_status" varchar(60) DEFAULT '',
	"xml_url" text,
	"pdf_url" text,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "gib_invoices_natural_key" ON "gib_invoices" USING btree ("direction","invoice_number","issue_date","counterparty_tax_id");