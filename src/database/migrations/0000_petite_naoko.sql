-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."audio_frequency" AS ENUM('f16khz', 'f24khz');--> statement-breakpoint
CREATE TYPE "public"."email_type" AS ENUM('insufficient_tokens_recording', 'payment_activation', 'usage_report', 'welcome', 'usage-reports', 'product-updates', 'maintenance', 'company-news', 'api-changes', 'developer-resources', 'security', 'billing');--> statement-breakpoint
CREATE TYPE "public"."meeting_to_join" AS ENUM('all', 'owned', 'internal', 'external');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('google', 'microsoft', 'apple');--> statement-breakpoint
CREATE TYPE "public"."recording_mode" AS ENUM('audio_only', 'speaker_view', 'gallery_view');--> statement-breakpoint
CREATE TYPE "public"."speech_to_text_provider" AS ENUM('gladia', 'runpod', 'default');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid');--> statement-breakpoint
CREATE TABLE "__diesel_schema_migrations" (
	"version" varchar(50) PRIMARY KEY NOT NULL,
	"run_on" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_consumption" (
	"bot_id" integer NOT NULL,
	"recording_tokens" numeric DEFAULT '0' NOT NULL,
	"transcription_tokens" numeric DEFAULT '0' NOT NULL,
	"transcription_byok_tokens" numeric DEFAULT '0' NOT NULL,
	"streaming_output_tokens" numeric DEFAULT '0' NOT NULL,
	"streaming_input_tokens" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"billed_at" timestamp,
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_params" (
	"id" serial PRIMARY KEY NOT NULL,
	"bot_name" text NOT NULL,
	"bot_image" text,
	"speech_to_text_provider" "speech_to_text_provider",
	"enter_message" text,
	"recording_mode" "recording_mode",
	"speech_to_text_api_key" varchar,
	"streaming_input" varchar,
	"streaming_output" varchar,
	"waiting_room_timeout" integer,
	"noone_joined_timeout" integer,
	"deduplication_key" varchar,
	"extra" jsonb DEFAULT 'null'::jsonb,
	"webhook_url" varchar NOT NULL,
	"streaming_audio_frequency" "audio_frequency",
	"zoom_sdk_id" varchar,
	"zoom_sdk_pwd" varchar,
	"transcription_custom_parameters" jsonb
);
--> statement-breakpoint
CREATE TABLE "bot_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar NOT NULL,
	"reserved" boolean NOT NULL,
	"sent_at" timestamp NOT NULL,
	"received_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"account_id" integer NOT NULL,
	"sync_token" varchar NOT NULL,
	"email" varchar NOT NULL,
	"resource_id" varchar,
	"channel_expiration" timestamp NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"calendar_access_token" varchar NOT NULL,
	"calendar_refresh_token" varchar NOT NULL,
	"provider" "provider" NOT NULL,
	"encrypted_calendar_client_id" varchar NOT NULL,
	"encrypted_calendar_client_secret" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"email_type" "email_type" NOT NULL,
	"sent_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"metadata" jsonb,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "email_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"email_type" "email_type" NOT NULL,
	"frequency" varchar DEFAULT 'never' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_preferences_account_id_email_type_key" UNIQUE("account_id","email_type")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"account_id" integer NOT NULL,
	"meeting_url" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"calendar_id" integer NOT NULL,
	"attendees" json NOT NULL,
	"is_organizer" boolean NOT NULL,
	"end_time" timestamp NOT NULL,
	"error" varchar,
	"session_id" varchar,
	"recurring_event_id" varchar,
	"is_recurring" boolean NOT NULL,
	"agenda_id" integer,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"bot_param_id" integer,
	"raw" jsonb NOT NULL,
	"last_updated_at" timestamp NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_bots" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_time" timestamp,
	"bot_param_id" integer NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"account_id" integer NOT NULL,
	"meeting_url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" integer NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "provider_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bots" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"meeting_url" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"session_id" text,
	"reserved" boolean NOT NULL,
	"errors" text,
	"ended_at" timestamp,
	"mp4_s3_path" varchar DEFAULT '' NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"bot_param_id" integer NOT NULL,
	"event_id" integer,
	"scheduled_bot_id" integer,
	"diarization_v2" boolean DEFAULT false NOT NULL,
	"transcription_fails" integer,
	"diarization_fails" integer,
	"user_reported_error" jsonb,
	"transcription_payloads" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_tokens" (
	"account_id" integer PRIMARY KEY NOT NULL,
	"available_tokens" numeric DEFAULT '0' NOT NULL,
	"total_tokens_purchased" numeric DEFAULT '0' NOT NULL,
	"last_purchase_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL,
	"start_time" double precision NOT NULL,
	"end_time" double precision NOT NULL,
	"bot_id" integer NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"speaker" varchar NOT NULL,
	"bot_id" integer NOT NULL,
	"start_time" double precision NOT NULL,
	"lang" varchar,
	"end_time" double precision,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"status" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"firstname" varchar,
	"lastname" varchar,
	"phone" varchar,
	"company_name" varchar,
	"company_size" varchar,
	"usage_planned" varchar,
	"bots_api_key" text NOT NULL,
	"bots_webhook_url" text,
	"secret" varchar DEFAULT (gen_random_uuid()) NOT NULL,
	"full_name" text,
	"email_verified" boolean,
	"image" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"subscription_id" varchar,
	"customer_id" varchar,
	"product_id" varchar,
	"subscription_status" "subscription_status",
	"plan_id" varchar,
	"subscription_item_id" varchar,
	"trial_end" timestamp
);
--> statement-breakpoint
ALTER TABLE "bot_consumption" ADD CONSTRAINT "bot_consumption_bot_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bot_consumption" ADD CONSTRAINT "bot_consumption_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_bots" ADD CONSTRAINT "fk_scheduled_bot_params" FOREIGN KEY ("bot_param_id") REFERENCES "public"."bot_params"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_bots" ADD CONSTRAINT "fk_scheduled_bots_account" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_accounts" ADD CONSTRAINT "provider_accounts_user_id_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "bots_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "fk_bot_param_id" FOREIGN KEY ("bot_param_id") REFERENCES "public"."bot_params"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "fk_bots_event" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "fk_bots_scheduled_bot" FOREIGN KEY ("scheduled_bot_id") REFERENCES "public"."scheduled_bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tokens" ADD CONSTRAINT "user_tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bot_consumption_bot_id" ON "bot_consumption" USING btree ("bot_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_bot_params_stt_provider" ON "bot_params" USING btree ("speech_to_text_provider" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_email_logs_account_type_date" ON "email_logs" USING btree ("account_id" int4_ops,"email_type" int4_ops,"sent_at" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_scheduled_bots_start_time" ON "scheduled_bots" USING btree ("start_time" timestamp_ops);--> statement-breakpoint
CREATE INDEX "sessions_userid_token_idx" ON "sessions" USING btree ("user_id" int4_ops,"token" int4_ops);--> statement-breakpoint
CREATE INDEX "accounts_userid_idx" ON "provider_accounts" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_bots_account_date" ON "bots" USING btree ("account_id" int4_ops,"ended_at" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_bots_bot_param_id" ON "bots" USING btree ("bot_param_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_bots_ended_at" ON "bots" USING btree ("ended_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier" text_ops);
*/