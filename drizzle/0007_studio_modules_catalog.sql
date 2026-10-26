CREATE TABLE "studio_catalogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"catalog_text" text NOT NULL,
	"signature" text NOT NULL,
	"published_by" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_module_versions" (
	"module_id" text NOT NULL,
	"version" text NOT NULL,
	"app_slug" text DEFAULT 'studio' NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'staged' NOT NULL,
	"object_key" text NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"sha256" text NOT NULL,
	"hub_api_min" smallint NOT NULL,
	"hub_api_max" smallint NOT NULL,
	"notes_pl" text DEFAULT '' NOT NULL,
	"notes_en" text DEFAULT '' NOT NULL,
	"manifest" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_module_versions_module_id_version_pk" PRIMARY KEY("module_id","version")
);
--> statement-breakpoint
ALTER TABLE "studio_module_versions" ADD CONSTRAINT "studio_module_versions_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "studio_catalogs_issued_uq" ON "studio_catalogs" USING btree ("issued_at");