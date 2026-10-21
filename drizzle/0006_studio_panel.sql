CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip_hash" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"totp_secret_enc" text,
	"totp_enabled_at" timestamp with time zone,
	"totp_last_step" integer,
	"backup_code_hashes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "studio_apps" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_devices" (
	"license_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"slot" smallint NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"activated_at" timestamp with time zone NOT NULL,
	"last_seen" timestamp with time zone NOT NULL,
	CONSTRAINT "studio_devices_license_id_device_id_pk" PRIMARY KEY("license_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "studio_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_slug" text NOT NULL,
	"key" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	"entitlements" jsonb NOT NULL,
	"updates_until" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"max_devices" smallint DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"source_provider" text,
	"source_reference" text,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_licenses_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "studio_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"kind" text NOT NULL,
	"reference" text NOT NULL,
	"email" text NOT NULL,
	"amount_total" integer,
	"currency" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_prices" (
	"provider" text DEFAULT 'paddle' NOT NULL,
	"price_id" text NOT NULL,
	"app_slug" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"plan" text NOT NULL,
	"entitlements" jsonb NOT NULL,
	"update_months" smallint DEFAULT 12 NOT NULL,
	CONSTRAINT "studio_prices_provider_price_id_pk" PRIMARY KEY("provider","price_id")
);
--> statement-breakpoint
CREATE TABLE "studio_webhook_events" (
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "studio_webhook_events_provider_event_id_pk" PRIMARY KEY("provider","event_id")
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_devices" ADD CONSTRAINT "studio_devices_license_id_studio_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."studio_licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_licenses" ADD CONSTRAINT "studio_licenses_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_orders" ADD CONSTRAINT "studio_orders_license_id_studio_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."studio_licenses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_prices" ADD CONSTRAINT "studio_prices_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "studio_audit_at_idx" ON "studio_audit_log" USING btree ("at");--> statement-breakpoint
CREATE INDEX "studio_audit_target_idx" ON "studio_audit_log" USING btree ("target");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_devices_slot_uq" ON "studio_devices" USING btree ("license_id","slot");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_licenses_source_uq" ON "studio_licenses" USING btree ("source_provider","source_reference") WHERE "studio_licenses"."source_provider" is not null;--> statement-breakpoint
CREATE INDEX "studio_licenses_email_idx" ON "studio_licenses" USING btree ("email");--> statement-breakpoint
CREATE INDEX "studio_licenses_app_idx" ON "studio_licenses" USING btree ("app_slug");--> statement-breakpoint
CREATE INDEX "studio_orders_license_idx" ON "studio_orders" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "studio_orders_email_idx" ON "studio_orders" USING btree ("email");
--> statement-breakpoint
INSERT INTO "studio_apps" ("slug", "name") VALUES ('studio', 'Syntance Studio') ON CONFLICT ("slug") DO NOTHING;
