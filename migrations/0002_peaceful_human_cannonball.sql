CREATE TYPE "public"."reward_status" AS ENUM('pending', 'issued', 'redeemed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."referral_status" ADD VALUE 'pending';--> statement-breakpoint
ALTER TYPE "public"."referral_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TYPE "public"."share_platform" ADD VALUE 'facebook';--> statement-breakpoint
ALTER TYPE "public"."share_platform" ADD VALUE 'instagram';--> statement-breakpoint
CREATE TABLE "referral_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"reward_type" "discount_type" DEFAULT 'percentage' NOT NULL,
	"reward_value" integer DEFAULT 20 NOT NULL,
	"cookie_days" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "referrer_user_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "referred_user_id" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "click_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "conversion_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "reward_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "social_platform" "share_platform";--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "referrals" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "referral_config" ADD CONSTRAINT "referral_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_preorders_email" ON "preorders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_preorders_status" ON "preorders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_preorders_created_at" ON "preorders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_preorders_status_created" ON "preorders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_preorders_user_id" ON "preorders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_preorders_session_id" ON "preorders" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_preorders_shopify_order_id" ON "preorders" USING btree ("shopify_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_supabase_id" ON "users" USING btree ("supabase_id");--> statement-breakpoint
CREATE INDEX "idx_users_role_created" ON "users" USING btree ("role","created_at");--> statement-breakpoint
CREATE INDEX "idx_users_auth_source" ON "users" USING btree ("auth_source");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_event" ON "webhook_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_status" ON "webhook_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_created_at" ON "webhook_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_webhook_logs_stripe_event_id" ON "webhook_logs" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_preorder_id" ON "webhook_logs" USING btree ("preorder_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_logs_provider_event" ON "webhook_logs" USING btree ("provider","event");--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code");