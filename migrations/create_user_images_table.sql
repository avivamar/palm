-- 创建图片MIME类型枚举
DO $$ BEGIN
    CREATE TYPE image_mime_type AS ENUM ('image/jpeg', 'image/png', 'image/webp', 'image/gif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建用户图片表
CREATE TABLE IF NOT EXISTS user_images (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type image_mime_type NOT NULL,
    url TEXT NOT NULL,
    r2_key VARCHAR(500) NOT NULL,
    
    -- ChatGPT集成字段
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_analyzed BOOLEAN DEFAULT false,
    ai_description TEXT,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    CONSTRAINT fk_user_images_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created_at ON user_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_images_mime_type ON user_images(mime_type);
CREATE INDEX IF NOT EXISTS idx_user_images_ai_analyzed ON user_images(ai_analyzed);
CREATE INDEX IF NOT EXISTS idx_user_images_tags ON user_images USING GIN(tags);

-- 创建更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_user_images_updated_at ON user_images;
CREATE TRIGGER update_user_images_updated_at
    BEFORE UPDATE ON user_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的图片
CREATE POLICY "Users can view own images" ON user_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

CREATE POLICY "Users can insert own images" ON user_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

CREATE POLICY "Users can update own images" ON user_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

CREATE POLICY "Users can delete own images" ON user_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

-- 添加表注释
COMMENT ON TABLE user_images IS 'User uploaded images with ChatGPT integration support';
COMMENT ON COLUMN user_images.description IS 'User-provided image description';
COMMENT ON COLUMN user_images.tags IS 'Searchable tags for image categorization';
COMMENT ON COLUMN user_images.ai_analyzed IS 'Flag indicating if image has been processed by AI';
COMMENT ON COLUMN user_images.ai_description IS 'AI-generated image description for ChatGPT';
COMMENT ON COLUMN user_images.r2_key IS 'Cloudflare R2 object key for storage reference';