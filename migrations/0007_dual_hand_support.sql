-- 添加双手图片支持
-- 修改 palm_analysis_sessions 表以支持左右手独立上传

-- 1. 添加新列
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "left_hand_image_url" text;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "right_hand_image_url" text;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "image_metadata" jsonb;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "analysis_type" "palm_report_type" DEFAULT 'quick' NOT NULL;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "analysis_result" jsonb;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "processing_time" integer;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "completed_at" timestamp with time zone;
ALTER TABLE "palm_analysis_sessions" ADD COLUMN "upgraded_at" timestamp with time zone;

-- 2. 删除不再需要的列
ALTER TABLE "palm_analysis_sessions" DROP COLUMN IF EXISTS "image_id";
ALTER TABLE "palm_analysis_sessions" DROP COLUMN IF EXISTS "hand_type";
ALTER TABLE "palm_analysis_sessions" DROP COLUMN IF EXISTS "quick_report_id";
ALTER TABLE "palm_analysis_sessions" DROP COLUMN IF EXISTS "full_report_id";
ALTER TABLE "palm_analysis_sessions" DROP COLUMN IF EXISTS "processing_completed_at";

-- 3. 添加新索引
CREATE INDEX IF NOT EXISTS "idx_palm_sessions_analysis_type" ON "palm_analysis_sessions" ("analysis_type");

-- 4. 更新现有数据（如果有）
UPDATE "palm_analysis_sessions" 
SET "analysis_type" = 'quick' 
WHERE "analysis_type" IS NULL;

-- 5. 添加注释
COMMENT ON COLUMN "palm_analysis_sessions"."left_hand_image_url" IS '左手照片URL';
COMMENT ON COLUMN "palm_analysis_sessions"."right_hand_image_url" IS '右手照片URL';
COMMENT ON COLUMN "palm_analysis_sessions"."image_metadata" IS '图片元数据(尺寸、格式等)';
COMMENT ON COLUMN "palm_analysis_sessions"."analysis_type" IS '分析类型: quick(快速) 或 complete(完整)';
COMMENT ON COLUMN "palm_analysis_sessions"."analysis_result" IS '完整的分析结果JSON';
COMMENT ON COLUMN "palm_analysis_sessions"."processing_time" IS '处理时间(毫秒)';
COMMENT ON COLUMN "palm_analysis_sessions"."completed_at" IS '分析完成时间';
COMMENT ON COLUMN "palm_analysis_sessions"."upgraded_at" IS '升级到完整分析的时间';