-- These statements are a copy of the database/migrations created by Drizzle ORM. These are not run by the app.

-- Create email preferences table
CREATE TABLE "email_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"email_type" "email_type" NOT NULL,
	"frequency" varchar DEFAULT 'never' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_preferences_account_id_email_type_key" UNIQUE("account_id","email_type")
);

-- Add foreign key to email preferences table
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;

-- Add index to email preferences table
CREATE INDEX "email_preferences_account_id_email_type_idx" ON "email_preferences" ("account_id", "email_type");

-- Create email content table
CREATE TABLE "email_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"email_type" "email_type" NOT NULL,
	"content" varchar NOT NULL,
    "content_text" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key to email content table
ALTER TABLE "email_content" ADD CONSTRAINT "email_content_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;

-- Add index to email content table
CREATE INDEX "email_content_account_id_idx" ON "email_content" ("account_id");

-- Add subject, triggered_by and message_ids columns to email logs table
ALTER TABLE "email_logs" ADD COLUMN "subject" varchar;
ALTER TABLE "email_logs" ADD COLUMN "triggered_by" varchar DEFAULT 'system';
ALTER TABLE "email_logs" ADD COLUMN "message_ids" varchar;

-- Add new email types
ALTER TYPE "public"."email_type" ADD VALUE 'usage-reports';
ALTER TYPE "public"."email_type" ADD VALUE 'error-report';
ALTER TYPE "public"."email_type" ADD VALUE 'product-updates';
ALTER TYPE "public"."email_type" ADD VALUE 'maintenance';
ALTER TYPE "public"."email_type" ADD VALUE 'company-news';
ALTER TYPE "public"."email_type" ADD VALUE 'api-changes';
ALTER TYPE "public"."email_type" ADD VALUE 'developer-resources';
ALTER TYPE "public"."email_type" ADD VALUE 'security';
ALTER TYPE "public"."email_type" ADD VALUE 'billing';
ALTER TYPE "public"."email_type" ADD VALUE 'activity-updates';
ALTER TYPE "public"."email_type" ADD VALUE 'custom';

-- Data fix: Insert default email preferences for all existing users
WITH email_types AS (
  SELECT unnest(ARRAY[
    'usage-reports',
    'activity-updates',
    'product-updates',
    'maintenance',
    'company-news',
    'api-changes',
    'developer-resources',
    'security',
    'billing'
  ])::email_type as email_type,
  unnest(ARRAY[
    'Weekly',
    'Weekly',
    'Daily',
    'Weekly',
    'Weekly',
    'Weekly',
    'Weekly',
    'Weekly',
    'Weekly'
  ]) as default_frequency
)
INSERT INTO email_preferences (account_id, email_type, frequency, updated_at)
SELECT
  a.id as account_id,
  e.email_type,
  e.default_frequency,
  NOW()
FROM accounts a
CROSS JOIN email_types e
LEFT JOIN email_preferences ep
  ON ep.account_id = a.id AND ep.email_type = e.email_type
WHERE ep.id IS NULL;
