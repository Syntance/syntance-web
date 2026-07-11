CREATE TABLE "page_hits" (
	"path" text NOT NULL,
	"day" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_hits_path_day_pk" PRIMARY KEY("path","day")
);
--> statement-breakpoint
CREATE TABLE "stack_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"dot_color" text DEFAULT 'oklch(0.78 0 0)' NOT NULL,
	"show_in_hero" boolean DEFAULT false NOT NULL,
	"show_in_values" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
