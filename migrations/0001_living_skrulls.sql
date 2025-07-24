ALTER TABLE "preorders" ADD COLUMN "shopify_order_id" text;--> statement-breakpoint
ALTER TABLE "preorders" ADD COLUMN "shopify_order_number" text;--> statement-breakpoint
ALTER TABLE "preorders" ADD COLUMN "shopify_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preorders" ADD COLUMN "shopify_fulfillment_status" text;--> statement-breakpoint
ALTER TABLE "preorders" ADD COLUMN "shopify_error" text;--> statement-breakpoint
ALTER TABLE "preorders" ADD COLUMN "shopify_last_attempt_at" timestamp with time zone;