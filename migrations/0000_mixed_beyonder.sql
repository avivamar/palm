CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'active', 'paused', 'completed');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('email', 'sms', 'push');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."preorder_status" AS ENUM('initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_color" AS ENUM('Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('visited', 'purchased');--> statement-breakpoint
CREATE TYPE "public"."share_platform" AS ENUM('twitter', 'linkedin', 'whatsapp', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('success', 'failed', 'pending', 'retry', 'expired');--> statement-breakpoint
CREATE TABLE "counter" (
	"id" serial PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2) DEFAULT '0',
	"max_uses" integer,
	"used_count" integer DEFAULT 0,
	"valid_from" timestamp with time zone DEFAULT now(),
	"valid_until" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"description" text,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "campaign_type" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft',
	"target_audience" jsonb,
	"content" jsonb,
	"scheduled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"total_recipients" integer DEFAULT 0,
	"successful_sends" integer DEFAULT 0,
	"failed_sends" integer DEFAULT 0,
	"open_rate" numeric(5, 4),
	"click_rate" numeric(5, 4),
	"conversion_rate" numeric(5, 4),
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "preorders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"color" "product_color" NOT NULL,
	"price_id" text NOT NULL,
	"status" "preorder_status" DEFAULT 'initiated' NOT NULL,
	"session_id" text,
	"payment_intent_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"preorder_number" text,
	"locale" text DEFAULT 'en',
	"customer_notes" text,
	"estimated_delivery" date,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"billing_name" text,
	"billing_email" text,
	"billing_phone" text,
	"billing_address_line1" text,
	"billing_address_line2" text,
	"billing_city" text,
	"billing_state" text,
	"billing_country" text,
	"billing_postal_code" text,
	"discount_code" text,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"tracking_number" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"refunded_at" timestamp with time zone,
	"refund_amount" numeric(10, 2),
	"referrer_code" text,
	"share_nickname" text,
	"klaviyo_event_sent_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "preorders_preorder_number_unique" UNIQUE("preorder_number")
);
--> statement-breakpoint
CREATE TABLE "product_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"color" "product_color" NOT NULL,
	"total_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 10,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_inventory_color_unique" UNIQUE("color")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_code" text NOT NULL,
	"referee_email" text NOT NULL,
	"preorder_id" text,
	"status" "referral_status" DEFAULT 'visited',
	"reward_sent" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "share_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_code" text NOT NULL,
	"platform" "share_platform" NOT NULL,
	"share_type" text DEFAULT 'link',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"phone" text,
	"country" text,
	"marketing_consent" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"last_login_at" timestamp with time zone,
	"firebase_uid" text,
	"supabase_id" text,
	"auth_source" text DEFAULT 'supabase',
	"stripe_customer_id" text,
	"paypal_customer_id" text,
	"shopify_customer_id" text,
	"klaviyo_profile_id" text,
	"referral_code" text,
	"referral_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid"),
	CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "users_paypal_customer_id_unique" UNIQUE("paypal_customer_id"),
	CONSTRAINT "users_shopify_customer_id_unique" UNIQUE("shopify_customer_id"),
	CONSTRAINT "users_klaviyo_profile_id_unique" UNIQUE("klaviyo_profile_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"status" "webhook_status" NOT NULL,
	"email" text,
	"error" text,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"next_retry_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"received_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"preorder_id" text,
	"session_id" text,
	"payment_intent_id" text,
	"amount" numeric(10, 2),
	"currency" text,
	"color" "product_color",
	"locale" text,
	"stripe_event_id" text,
	"klaviyo_event_sent" boolean DEFAULT false,
	"klaviyo_event_type" text,
	"klaviyo_event_sent_at" timestamp,
	"raw_data" jsonb,
	CONSTRAINT "webhook_logs_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "preorders" ADD CONSTRAINT "preorders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_preorder_id_preorders_id_fk" FOREIGN KEY ("preorder_id") REFERENCES "public"."preorders"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_preorder_id_preorders_id_fk" FOREIGN KEY ("preorder_id") REFERENCES "public"."preorders"("id") ON DELETE set null ON UPDATE cascade;