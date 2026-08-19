CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(30) NOT NULL,
	"customer_id" integer,
	"job_id" integer,
	"offer_id" integer,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '20' NOT NULL,
	"total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'taslak' NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date,
	"paid_date" date,
	"note" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"sku" varchar(60) DEFAULT '',
	"category" varchar(60) DEFAULT '',
	"unit" varchar(20) DEFAULT 'adet' NOT NULL,
	"cost_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(10) NOT NULL,
	"category" varchar(30) DEFAULT 'diger-gider' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"method" varchar(20) DEFAULT 'nakit' NOT NULL,
	"description" text DEFAULT '',
	"job_id" integer,
	"customer_id" integer,
	"invoice_id" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "tax_rate" numeric(5, 2) DEFAULT '20' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;