-- 生产环境数据库初始化脚本
-- 紧急修复：创建所有必需的表和数据结构

-- 1. 创建所有枚举类型
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE preorder_status AS ENUM ('initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE webhook_status AS ENUM ('success', 'failed', 'pending', 'retry', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_color AS ENUM ('Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('visited', 'purchased', 'pending', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE share_platform AS ENUM ('twitter', 'linkedin', 'whatsapp', 'telegram', 'facebook', 'instagram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reward_status AS ENUM ('pending', 'issued', 'redeemed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE image_mime_type AS ENUM ('image/jpeg', 'image/png', 'image/webp', 'image/gif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 创建用户表（核心表）
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    phone TEXT,
    country TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    firebase_uid TEXT UNIQUE,
    supabase_id TEXT UNIQUE,
    auth_source TEXT DEFAULT 'supabase',
    stripe_customer_id TEXT UNIQUE,
    paypal_customer_id TEXT UNIQUE,
    shopify_customer_id TEXT UNIQUE,
    klaviyo_profile_id TEXT UNIQUE,
    referral_code TEXT UNIQUE,
    referral_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建预订表
CREATE TABLE IF NOT EXISTS preorders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    email TEXT NOT NULL,
    color product_color NOT NULL,
    price_id TEXT NOT NULL,
    status preorder_status DEFAULT 'initiated' NOT NULL,
    session_id TEXT,
    payment_intent_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    preorder_number TEXT UNIQUE,
    locale TEXT DEFAULT 'en',
    customer_notes TEXT,
    estimated_delivery DATE,
    shipping_address JSONB,
    billing_address JSONB,
    billing_name TEXT,
    billing_email TEXT,
    billing_phone TEXT,
    billing_address_line1 TEXT,
    billing_address_line2 TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_country TEXT,
    billing_postal_code TEXT,
    discount_code TEXT,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2),
    referrer_code TEXT,
    share_nickname TEXT,
    klaviyo_event_sent_at TIMESTAMP WITH TIME ZONE,
    shopify_order_id TEXT,
    shopify_order_number TEXT,
    shopify_synced_at TIMESTAMP WITH TIME ZONE,
    shopify_fulfillment_status TEXT,
    shopify_error TEXT,
    shopify_last_attempt_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 创建Webhook日志表
CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    event TEXT NOT NULL,
    provider TEXT DEFAULT 'stripe' NOT NULL,
    status webhook_status NOT NULL,
    email TEXT,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    preorder_id TEXT REFERENCES preorders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    session_id TEXT,
    payment_intent_id TEXT,
    amount DECIMAL(10, 2),
    currency TEXT,
    color product_color,
    locale TEXT,
    stripe_event_id TEXT UNIQUE,
    klaviyo_event_sent BOOLEAN DEFAULT false,
    klaviyo_event_type TEXT,
    klaviyo_event_sent_at TIMESTAMP WITH TIME ZONE,
    raw_data JSONB
);

-- 5. 创建计数器表
CREATE TABLE IF NOT EXISTS counter (
    id SERIAL PRIMARY KEY,
    count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. 创建用户图片表
CREATE TABLE IF NOT EXISTS user_images (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type image_mime_type NOT NULL,
    url TEXT NOT NULL,
    r2_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_analyzed BOOLEAN DEFAULT false,
    ai_description TEXT
);

-- 7. 创建产品库存表
CREATE TABLE IF NOT EXISTS product_inventory (
    id SERIAL PRIMARY KEY,
    color product_color UNIQUE NOT NULL,
    total_quantity INTEGER DEFAULT 0 NOT NULL,
    reserved_quantity INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 创建折扣码表
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type discount_type NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 创建营销活动表
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type campaign_type NOT NULL,
    status campaign_status DEFAULT 'draft',
    target_audience JSONB,
    content JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    open_rate DECIMAL(5, 4),
    click_rate DECIMAL(5, 4),
    conversion_rate DECIMAL(5, 4),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. 创建推荐表
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_code TEXT NOT NULL,
    referee_email TEXT NOT NULL,
    preorder_id TEXT REFERENCES preorders(id) ON DELETE SET NULL ON UPDATE CASCADE,
    status referral_status DEFAULT 'visited',
    reward_sent BOOLEAN DEFAULT false,
    referrer_user_id TEXT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    referred_user_id TEXT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    referral_code TEXT UNIQUE,
    click_count INTEGER DEFAULT 0 NOT NULL,
    conversion_count INTEGER DEFAULT 0 NOT NULL,
    reward_amount INTEGER DEFAULT 0 NOT NULL,
    discount_amount INTEGER DEFAULT 0 NOT NULL,
    social_platform share_platform,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. 创建推荐配置表
CREATE TABLE IF NOT EXISTS referral_config (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT false NOT NULL,
    reward_type discount_type DEFAULT 'percentage' NOT NULL,
    reward_value INTEGER DEFAULT 20 NOT NULL,
    cookie_days INTEGER DEFAULT 30 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 12. 创建分享活动表
CREATE TABLE IF NOT EXISTS share_activities (
    id TEXT PRIMARY KEY,
    referral_code TEXT NOT NULL,
    platform share_platform NOT NULL,
    share_type TEXT DEFAULT 'link',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. 创建所有必要的索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_role_created ON users(role, created_at);
CREATE INDEX IF NOT EXISTS idx_users_auth_source ON users(auth_source);

CREATE INDEX IF NOT EXISTS idx_preorders_email ON preorders(email);
CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
CREATE INDEX IF NOT EXISTS idx_preorders_created_at ON preorders(created_at);
CREATE INDEX IF NOT EXISTS idx_preorders_status_created ON preorders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_preorders_user_id ON preorders(user_id);
CREATE INDEX IF NOT EXISTS idx_preorders_session_id ON preorders(session_id);
CREATE INDEX IF NOT EXISTS idx_preorders_shopify_order_id ON preorders(shopify_order_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_logs_stripe_event_id ON webhook_logs(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_preorder_id ON webhook_logs(preorder_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider_event ON webhook_logs(provider, event);

CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created_at ON user_images(created_at);
CREATE INDEX IF NOT EXISTS idx_user_images_ai_analyzed ON user_images(ai_analyzed);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_images_r2_key ON user_images(r2_key);

-- 14. 创建自动更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. 为各表创建更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preorders_updated_at ON preorders;
CREATE TRIGGER update_preorders_updated_at
    BEFORE UPDATE ON preorders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_images_updated_at ON user_images;
CREATE TRIGGER update_user_images_updated_at
    BEFORE UPDATE ON user_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 16. 插入初始数据
INSERT INTO counter (count) 
SELECT 0 
WHERE NOT EXISTS (SELECT 1 FROM counter);

-- 插入默认推荐配置
INSERT INTO referral_config (enabled, reward_type, reward_value, cookie_days)
SELECT false, 'percentage', 20, 30
WHERE NOT EXISTS (SELECT 1 FROM referral_config);

-- 17. 启用行级安全策略（RLS）用于用户图片
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的图片
DROP POLICY IF EXISTS "Users can view own images" ON user_images;
CREATE POLICY "Users can view own images" ON user_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

DROP POLICY IF EXISTS "Users can insert own images" ON user_images;
CREATE POLICY "Users can insert own images" ON user_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

DROP POLICY IF EXISTS "Users can update own images" ON user_images;
CREATE POLICY "Users can update own images" ON user_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

DROP POLICY IF EXISTS "Users can delete own images" ON user_images;
CREATE POLICY "Users can delete own images" ON user_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = user_images.user_id 
            AND (users.supabase_id = auth.uid()::text OR users.email = auth.email())
        )
    );

COMMIT;