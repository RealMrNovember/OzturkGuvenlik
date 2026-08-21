ALTER TABLE "offers" ADD COLUMN "public_token" varchar(64);--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "responded_at" timestamp;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_public_token_unique" UNIQUE("public_token");