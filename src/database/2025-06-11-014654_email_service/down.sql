-- Remove data fix: Delete default email preferences
DELETE FROM email_preferences 
WHERE email_type IN (
    'usage-reports',
    'activity-updates',
    'product-updates',
    'maintenance',
    'company-news',
    'api-changes',
    'developer-resources',
    'security',
    'billing'
);

-- Drop email content table and its dependencies
DROP INDEX IF EXISTS "email_content_account_id_idx";
ALTER TABLE "email_content" DROP CONSTRAINT IF EXISTS "email_content_account_id_fkey";
DROP TABLE IF EXISTS "email_content";

-- Drop email preferences table and its dependencies
DROP INDEX IF EXISTS "email_preferences_account_id_email_type_idx";
ALTER TABLE "email_preferences" DROP CONSTRAINT IF EXISTS "email_preferences_account_id_fkey";
DROP TABLE IF EXISTS "email_preferences";


-- Handle email_type enum reversion. Postgres does not support dropping enum values.
-- We need to create a new enum type with original values and update the columns to use the new type.
-- Then, we can drop the old type and rename the new one.

-- First, delete all logs with the old email types
DELETE FROM email_logs 
WHERE email_type IN (
    'usage-reports',
    'error-report',
    'activity-updates',
    'product-updates',
    'maintenance',
    'company-news',
    'api-changes',
    'developer-resources',
    'security',
    'billing',
    'custom'
);

-- Then, create a new enum type with original values from 2025-02-22-091550_store_sent_emails up.sql
CREATE TYPE email_type_new AS ENUM (
    'insufficient_tokens_recording',
    'payment_activation',
    'usage_report',
    'welcome'
);

-- Update columns to use the new type
ALTER TABLE email_logs 
    ALTER COLUMN email_type TYPE email_type_new 
    USING email_type::text::email_type_new;

-- Drop the old type and rename the new one
DROP TYPE email_type;
ALTER TYPE email_type_new RENAME TO email_type;

-- Remove columns from email logs table
ALTER TABLE "email_logs" DROP COLUMN IF EXISTS "subject";
ALTER TABLE "email_logs" DROP COLUMN IF EXISTS "triggered_by";
ALTER TABLE "email_logs" DROP COLUMN IF EXISTS "message_ids";