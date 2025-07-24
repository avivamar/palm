CREATE TYPE "public"."image_mime_type" AS ENUM('image/jpeg', 'image/png', 'image/webp', 'image/gif');--> statement-breakpoint
CREATE TABLE "user_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" "image_mime_type" NOT NULL,
	"url" text NOT NULL,
	"r2_key" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"description" text,
	"tags" text[],
	"ai_analyzed" boolean DEFAULT false NOT NULL,
	"ai_description" text,
	CONSTRAINT "user_images_r2_key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_images_user_id" ON "user_images" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_images_created_at" ON "user_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_images_ai_analyzed" ON "user_images" USING btree ("ai_analyzed");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_images_r2_key" ON "user_images" USING btree ("r2_key");