ALTER TABLE "customers" ADD COLUMN "email" varchar(190) DEFAULT '';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;