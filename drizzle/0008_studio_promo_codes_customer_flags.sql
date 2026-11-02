CREATE TABLE "studio_customer_flags" (
	"email" text PRIMARY KEY NOT NULL,
	"blocked_at" timestamp with time zone,
	"blocked_reason" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_slug" text DEFAULT 'studio' NOT NULL,
	"code" text NOT NULL,
	"kind" text NOT NULL,
	"percent_off" smallint,
	"amount_off" integer,
	"currency" text,
	"trial_days" smallint,
	"grant_plan" text,
	"grant_entitlements" jsonb,
	"grant_update_months" smallint,
	"grant_max_devices" smallint,
	"applies_to_plan" text,
	"applies_to_entitlements" jsonb,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"provider_discount_id" text,
	"note" text DEFAULT '' NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "studio_promo_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_id" uuid NOT NULL,
	"email" text NOT NULL,
	"license_id" uuid,
	"source" text NOT NULL,
	"discount_amount" integer,
	"currency" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_promo_codes" ADD CONSTRAINT "studio_promo_codes_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_promo_redemptions" ADD CONSTRAINT "studio_promo_redemptions_code_id_studio_promo_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."studio_promo_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_promo_redemptions" ADD CONSTRAINT "studio_promo_redemptions_license_id_studio_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."studio_licenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "studio_promo_app_idx" ON "studio_promo_codes" USING btree ("app_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_promo_redemptions_uq" ON "studio_promo_redemptions" USING btree ("code_id","email");--> statement-breakpoint
CREATE INDEX "studio_promo_redemptions_code_idx" ON "studio_promo_redemptions" USING btree ("code_id");