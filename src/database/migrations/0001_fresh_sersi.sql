CREATE TABLE "email_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"email_type" "email_type" NOT NULL,
	"content" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_content" ADD CONSTRAINT "email_content_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;