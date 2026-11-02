CREATE TABLE "studio_features" (
	"key" text PRIMARY KEY NOT NULL,
	"app_slug" text DEFAULT 'studio' NOT NULL,
	"label" text NOT NULL,
	"entitlement" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_slug" text DEFAULT 'studio' NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'paid' NOT NULL,
	"billing" text DEFAULT 'perpetual' NOT NULL,
	"update_months" smallint DEFAULT 12 NOT NULL,
	"max_devices" smallint DEFAULT 2 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_licenses" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "studio_licenses" ADD COLUMN "features" jsonb;--> statement-breakpoint
ALTER TABLE "studio_prices" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "studio_features" ADD CONSTRAINT "studio_features_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_plans" ADD CONSTRAINT "studio_plans_app_slug_studio_apps_slug_fk" FOREIGN KEY ("app_slug") REFERENCES "public"."studio_apps"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "studio_plans_slug_uq" ON "studio_plans" USING btree ("app_slug","slug");--> statement-breakpoint
ALTER TABLE "studio_licenses" ADD CONSTRAINT "studio_licenses_plan_id_studio_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."studio_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_prices" ADD CONSTRAINT "studio_prices_plan_id_studio_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."studio_plans"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "studio_features" ("key", "app_slug", "label", "entitlement") VALUES
('viewer', 'studio', 'Przeglądanie, wyszukiwanie i druk', NULL),
('comments', 'studio', 'Komentarze i adnotacje', NULL),
('organize', 'studio', 'Organizacja stron', 'pro'),
('board', 'studio', 'Scalanie i dzielenie', 'pro'),
('images', 'studio', 'Obrazy w PDF', 'pro'),
('edit', 'studio', 'Edycja treści', 'pro'),
('design', 'studio', 'Projektowanie (tryb Projekt)', 'pro'),
('forms', 'studio', 'Formularze', 'pro'),
('redact', 'studio', 'Redakcja (zaczernianie)', 'pro'),
('protect', 'studio', 'Zabezpieczanie', 'pro'),
('ocr', 'studio', 'OCR', 'pro'),
('signatures', 'studio', 'Podpisy', 'pro'),
('convert', 'studio', 'Konwersja', 'pro'),
('batch', 'studio', 'Przetwarzanie wsadowe', 'pro'),
('compare', 'studio', 'Porównywanie dokumentów', 'pro'),
('readaloud', 'studio', 'Czytanie na głos', 'pro'),
('prepress', 'studio', 'Moduł Print (prepress)', 'print'),
('vector', 'studio', 'Moduł Wektor', 'vector'),
('image', 'studio', 'Moduł Obraz', 'image')
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
INSERT INTO "studio_plans" ("app_slug", "slug", "name", "description", "kind", "billing", "update_months", "max_devices", "features", "sort_order")
VALUES ('studio', 'free', 'Free', 'Co działa bez licencji.', 'free', 'perpetual', 12, 1, '["viewer","comments"]'::jsonb, 0)
ON CONFLICT ("app_slug", "slug") DO NOTHING;
