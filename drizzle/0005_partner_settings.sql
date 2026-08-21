CREATE TABLE "partner_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
