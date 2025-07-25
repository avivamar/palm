CREATE TYPE "public"."palm_analysis_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."palm_hand_type" AS ENUM('left', 'right', 'both');--> statement-breakpoint
CREATE TYPE "public"."palm_report_type" AS ENUM('quick', 'full', 'premium');--> statement-breakpoint
CREATE TABLE "palm_analysis_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"image_id" integer,
	"status" "palm_analysis_status" DEFAULT 'pending' NOT NULL,
	"hand_type" "palm_hand_type" NOT NULL,
	"birth_date" date,
	"birth_time" text,
	"birth_location" text,
	"palm_features" jsonb,
	"quick_report_id" text,
	"full_report_id" text,
	"processing_started_at" timestamp with time zone,
	"processing_completed_at" timestamp with time zone,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"conversion_step" text DEFAULT 'uploaded',
	"payment_intent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "palm_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"report_id" text,
	"rating" integer NOT NULL,
	"accuracy" integer,
	"usefulness" integer,
	"satisfaction" integer,
	"comment" text,
	"improvements" text,
	"feedback_type" text DEFAULT 'general',
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "palm_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"report_type" "palm_report_type" NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"personality_analysis" jsonb,
	"health_analysis" jsonb,
	"career_analysis" jsonb,
	"relationship_analysis" jsonb,
	"fortune_analysis" jsonb,
	"detailed_analysis" jsonb,
	"recommendations" jsonb,
	"future_insights" jsonb,
	"compatibility_analysis" jsonb,
	"daily_guidance" jsonb,
	"monthly_forecast" jsonb,
	"yearly_outlook" jsonb,
	"confidence" numeric(3, 2),
	"language" text DEFAULT 'en',
	"version" text DEFAULT '1.0',
	"is_paid" boolean DEFAULT false,
	"access_expires_at" timestamp with time zone,
	"view_count" integer DEFAULT 0,
	"last_viewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "palm_analysis_sessions" ADD CONSTRAINT "palm_analysis_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_analysis_sessions" ADD CONSTRAINT "palm_analysis_sessions_image_id_user_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."user_images"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_feedback" ADD CONSTRAINT "palm_feedback_session_id_palm_analysis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."palm_analysis_sessions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_feedback" ADD CONSTRAINT "palm_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_feedback" ADD CONSTRAINT "palm_feedback_report_id_palm_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."palm_reports"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_reports" ADD CONSTRAINT "palm_reports_session_id_palm_analysis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."palm_analysis_sessions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "palm_reports" ADD CONSTRAINT "palm_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_palm_sessions_user_id" ON "palm_analysis_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_palm_sessions_status" ON "palm_analysis_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_palm_sessions_created_at" ON "palm_analysis_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_palm_sessions_image_id" ON "palm_analysis_sessions" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "idx_palm_sessions_conversion" ON "palm_analysis_sessions" USING btree ("conversion_step");--> statement-breakpoint
CREATE INDEX "idx_palm_feedback_session_id" ON "palm_feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_palm_feedback_user_id" ON "palm_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_palm_feedback_rating" ON "palm_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_palm_feedback_created_at" ON "palm_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_session_id" ON "palm_reports" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_user_id" ON "palm_reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_type" ON "palm_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_is_paid" ON "palm_reports" USING btree ("is_paid");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_created_at" ON "palm_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_palm_reports_access_expires" ON "palm_reports" USING btree ("access_expires_at");