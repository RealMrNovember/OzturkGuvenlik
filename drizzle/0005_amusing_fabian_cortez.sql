CREATE TABLE "product_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"serial_number" varchar(120) NOT NULL,
	"status" varchar(20) DEFAULT 'stokta' NOT NULL,
	"job_id" integer,
	"service_ticket_id" integer,
	"note" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"installed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_color" varchar(7) DEFAULT '#0e6fb8' NOT NULL,
	"brand_light_color" varchar(7) DEFAULT '#40a0e0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "barcode" varchar(64);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "serialized" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_service_ticket_id_service_tickets_id_fk" FOREIGN KEY ("service_ticket_id") REFERENCES "public"."service_tickets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_units_product_serial_unique" ON "product_units" USING btree ("product_id","serial_number");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_barcode_unique" UNIQUE("barcode");