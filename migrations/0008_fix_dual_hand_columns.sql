-- Fix dual hand support by manually adding missing columns
-- This addresses the "column left_hand_image_url does not exist" error

-- Check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add left_hand_image_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='left_hand_image_url') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "left_hand_image_url" text;
    END IF;
    
    -- Add right_hand_image_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='right_hand_image_url') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "right_hand_image_url" text;
    END IF;
    
    -- Add image_metadata if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='image_metadata') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "image_metadata" jsonb;
    END IF;
    
    -- Add analysis_result if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='analysis_result') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "analysis_result" jsonb;
    END IF;
    
    -- Add processing_time if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='processing_time') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "processing_time" integer;
    END IF;
    
    -- Add completed_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='palm_analysis_sessions' AND column_name='completed_at') THEN
        ALTER TABLE "palm_analysis_sessions" ADD COLUMN "completed_at" timestamp with time zone;
    END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN "palm_analysis_sessions"."left_hand_image_url" IS '左手照片URL';
COMMENT ON COLUMN "palm_analysis_sessions"."right_hand_image_url" IS '右手照片URL';
COMMENT ON COLUMN "palm_analysis_sessions"."image_metadata" IS '图片元数据(尺寸、格式等)';
COMMENT ON COLUMN "palm_analysis_sessions"."analysis_result" IS '完整的分析结果JSON';
COMMENT ON COLUMN "palm_analysis_sessions"."processing_time" IS '处理时间(毫秒)';
COMMENT ON COLUMN "palm_analysis_sessions"."completed_at" IS '分析完成时间';