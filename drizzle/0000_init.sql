CREATE TABLE "seo_global" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"meta_title" text,
	"meta_title_template" text,
	"meta_description" text,
	"canonical_url" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"twitter_title" text,
	"twitter_description" text,
	"twitter_image_alt" text,
	"organization_name" text,
	"organization_description" text,
	"founding_date" text,
	"founder_name" text,
	"contact_email" text,
	"contact_phone" text,
	"address" jsonb,
	"geo" jsonb,
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"opening_hours" jsonb,
	"services" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seo_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"canonical_url" text,
	"focus_keyword" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"keyword_density" text,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"twitter_title" text,
	"twitter_description" text,
	"seo_notes" text,
	"last_updated" timestamp with time zone DEFAULT now(),
	CONSTRAINT "seo_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faq_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"section" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_id" text,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"logo_url" text,
	"logo_alt" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"show_in_configurator" boolean DEFAULT true NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_config" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"hours" real DEFAULT 0 NOT NULL,
	"rate_type" text,
	"category_id" text,
	"project_types" jsonb DEFAULT '[]'::jsonb,
	"required" boolean DEFAULT false NOT NULL,
	"default_selected" boolean DEFAULT false NOT NULL,
	"included_in_base" boolean DEFAULT false NOT NULL,
	"max_quantity" integer,
	"percentage_add" real,
	"order_rank" text,
	"configurator_order_ranks" jsonb,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"bundled_with" jsonb DEFAULT '[]'::jsonb,
	"popular" boolean DEFAULT false NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"hide_price" boolean DEFAULT false NOT NULL,
	"extra" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "project_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_price" integer,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_rules" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"slot_minutes" integer DEFAULT 30 NOT NULL,
	"working_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
	"working_hours_start" text DEFAULT '10:00' NOT NULL,
	"working_hours_end" text DEFAULT '17:00' NOT NULL,
	"slot_presets" jsonb DEFAULT '["10:00","13:00","16:00"]'::jsonb NOT NULL,
	"buffer_before_minutes" integer DEFAULT 0 NOT NULL,
	"buffer_after_minutes" integer DEFAULT 15 NOT NULL,
	"min_notice_hours" integer DEFAULT 12 NOT NULL,
	"max_advance_days" integer DEFAULT 60 NOT NULL,
	"timezone" text DEFAULT 'Europe/Warsaw' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_id" text,
	"title" text NOT NULL,
	"all_day" boolean DEFAULT false NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "meeting_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_id" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"topic" text,
	"source" text,
	"meet_link" text,
	"google_event_id" text,
	"google_calendar_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contract_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sanity_id" text,
	"label" text NOT NULL,
	"file_url" text,
	"file_name" text,
	"project_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
