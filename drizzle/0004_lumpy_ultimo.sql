CREATE TABLE "service_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"appointment_id" integer,
	"device" varchar(200) DEFAULT '',
	"location" varchar(255) DEFAULT '',
	"issue" text NOT NULL,
	"result" text DEFAULT '',
	"status" varchar(20) DEFAULT 'acik' NOT NULL,
	"assigned_to" integer,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cost_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;