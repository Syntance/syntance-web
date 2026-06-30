ALTER TABLE "portfolio_items" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "project_type" text DEFAULT 'website' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "description" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "highlights" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "stack" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "problem_statement" text;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "rebuild_context" text;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "preview_image_fallback" text;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD COLUMN "preview_image_alt" text;--> statement-breakpoint
UPDATE "portfolio_items"
SET "slug" = COALESCE(
  NULLIF(regexp_replace(lower(trim("sanity_id")), '[^a-z0-9]+', '-', 'g'), ''),
  NULLIF(regexp_replace(lower(trim("name")), '[^a-z0-9]+', '-', 'g'), ''),
  'realizacja-' || substr(replace("id"::text, '-', ''), 1, 8)
)
WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "portfolio_items" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_items_slug_unique" ON "portfolio_items" ("slug");
