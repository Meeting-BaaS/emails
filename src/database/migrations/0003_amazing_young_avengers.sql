ALTER TABLE "email_logs" ADD COLUMN "frequency" varchar DEFAULT 'never';--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "triggered_by" varchar DEFAULT 'system';