CREATE TABLE "maintenance_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"type" varchar(100) DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"last_service_date" date,
	"next_service_date" date NOT NULL,
	"interval_months" integer DEFAULT 12 NOT NULL,
	"note" text DEFAULT '',
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenance_contracts" ADD CONSTRAINT "maintenance_contracts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;