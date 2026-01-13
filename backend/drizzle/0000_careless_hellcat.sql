CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_path" text NOT NULL,
	"processed_path" text NOT NULL,
	"page_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
