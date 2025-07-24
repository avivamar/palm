-- Migration: Create user_images table for image upload functionality
-- Supporting Cloudflare R2 storage with ChatGPT integration fields

-- 创建图片MIME类型枚举
DO $$ BEGIN
    CREATE TYPE image_mime_type AS ENUM ('image/jpeg', 'image/png', 'image/webp', 'image/gif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_images (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type image_mime_type NOT NULL,
    url TEXT NOT NULL,
    r2_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ChatGPT 集成预留字段
    description TEXT,
    tags TEXT[],
    ai_analyzed BOOLEAN DEFAULT FALSE,
    ai_description TEXT
);

-- 创建索引（在表创建之后）
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created_at ON user_images(created_at);
CREATE INDEX IF NOT EXISTS idx_user_images_ai_analyzed ON user_images(ai_analyzed);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_images_r2_key ON user_images(r2_key);

-- 添加更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_images_updated_at 
    BEFORE UPDATE ON user_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE user_images IS '用户图片表，支持Cloudflare R2存储和ChatGPT集成';
COMMENT ON COLUMN user_images.user_id IS '关联用户ID';
COMMENT ON COLUMN user_images.file_name IS '原始文件名';
COMMENT ON COLUMN user_images.file_size IS '文件大小（字节）';
COMMENT ON COLUMN user_images.mime_type IS '文件MIME类型，限制为支持的图片格式';
COMMENT ON COLUMN user_images.url IS '公共访问URL';
COMMENT ON COLUMN user_images.r2_key IS 'Cloudflare R2存储key，唯一标识';
COMMENT ON COLUMN user_images.description IS '图片描述（用户输入）';
COMMENT ON COLUMN user_images.tags IS '图片标签数组';
COMMENT ON COLUMN user_images.ai_analyzed IS 'ChatGPT是否已分析';
COMMENT ON COLUMN user_images.ai_description IS 'ChatGPT生成的图片描述';