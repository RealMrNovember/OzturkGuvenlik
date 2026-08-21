ALTER TABLE "users" ADD COLUMN "reset_token" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_reset_token_unique" UNIQUE("reset_token");