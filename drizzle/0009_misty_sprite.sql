ALTER TABLE "service_tickets" ADD COLUMN "category" varchar(30) DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "request_type" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "billing_type" varchar(20) DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "start_time" varchar(5) DEFAULT '';--> statement-breakpoint
ALTER TABLE "service_tickets" ADD COLUMN "end_time" varchar(5) DEFAULT '';