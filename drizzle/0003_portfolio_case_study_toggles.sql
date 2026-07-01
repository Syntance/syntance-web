ALTER TABLE "portfolio_items" ADD COLUMN "case_study_enabled" boolean NOT NULL DEFAULT true;
ALTER TABLE "portfolio_items" ADD COLUMN "admin_gallery_enabled" boolean NOT NULL DEFAULT false;
UPDATE "portfolio_items" SET "case_study_enabled" = false WHERE "slug" = 'retrohouse';
