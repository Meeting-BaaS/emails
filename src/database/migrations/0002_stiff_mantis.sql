ALTER TABLE "email_content" DROP CONSTRAINT IF EXISTS "email_content_account_id_email_type_key";--> statement-breakpoint
ALTER TABLE "email_content" ADD COLUMN "content_text" varchar NOT NULL;