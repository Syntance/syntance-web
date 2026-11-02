CREATE TABLE "studio_releases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_slug" text DEFAULT 'studio' NOT NULL,
	"version" text NOT NULL,
	"channel" text NOT NULL,
	"platform" text DEFAULT 'win' NOT NULL,
	"filename" text NOT NULL,
	"object_key" text NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"sha256" text NOT NULL,
	"notes_pl" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_plans" ADD COLUMN "price_amount" integer;--> statement-breakpoint
ALTER TABLE "studio_plans" ADD COLUMN "price_currency" text;--> statement-breakpoint
ALTER TABLE "studio_releases" ADD CONSTRAINT "studio_releases_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "studio_releases_uq" ON "studio_releases" USING btree ("app_slug","version","channel","platform");--> statement-breakpoint
CREATE INDEX "studio_releases_pub_idx" ON "studio_releases" USING btree ("published","published_at");