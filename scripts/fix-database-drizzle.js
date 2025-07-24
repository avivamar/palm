#!/usr/bin/env node

/**
 * 使用 Drizzle 修复数据库问题
 * 解决预订页面的数据库相关错误
 */

const fs = require('node:fs');
const path = require('node:path');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

console.log('🔧 开始使用 Drizzle 修复数据库问题...\n');

// 1. 检查环境变量
console.log('1️⃣ 检查环境变量配置...');
try {
  require('dotenv').config({ path: '.env.production' });

  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missingVars.join(', '));
    console.log('💡 请检查 .env.production 文件');
    process.exit(1);
  }

  console.log('✅ 环境变量检查通过');
} catch (error) {
  console.error('❌ 环境变量检查失败:', error.message);
  process.exit(1);
}

async function fixDatabase() {
  let client;

  try {
    // 2. 连接数据库
    console.log('\n2️⃣ 连接数据库...');

    // 清理数据库URL，移除无效的查询参数
    let databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl.includes('supa=base-pooler.x')) {
      databaseUrl = databaseUrl.replace('&supa=base-pooler.x', '');
      console.log('🔧 已清理数据库URL中的无效参数');
    }

    client = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
    });

    const db = drizzle(client);
    console.log('✅ 数据库连接成功');

    // 3. 执行修复SQL
    console.log('\n3️⃣ 执行数据库修复...');

    const fixSQL = `
-- 数据库修复脚本
-- 解决预订页面的数据库问题

-- 1. 创建必要的枚举类型（如果不存在）
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
    CREATE TYPE product_color AS ENUM ('Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE webhook_status AS ENUM ('success', 'failed', 'pending', 'retry', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. 创建用户表（如果不存在）
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建预订表（如果不存在）
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建webhook日志表（如果不存在）
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
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- 5. 创建计数器表（如果不存在）
CREATE TABLE IF NOT EXISTS counter (
    id SERIAL PRIMARY KEY,
    count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_preorders_email ON preorders(email);
CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
CREATE INDEX IF NOT EXISTS idx_preorders_user_id ON preorders(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- 7. 插入初始计数器记录（如果不存在）
INSERT INTO counter (count) 
SELECT 0 
WHERE NOT EXISTS (SELECT 1 FROM counter);
`;

    // 执行修复SQL
    await client.unsafe(fixSQL);
    console.log('✅ 数据库修复SQL执行成功');

    // 4. 验证修复结果
    console.log('\n4️⃣ 验证数据库修复结果...');

    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('📋 数据库表列表:');
    tables.forEach((table) => {
      console.log(`  - ${table.table_name}`);
    });

    // 检查关键表是否存在
    const requiredTables = ['users', 'preorders', 'webhook_logs', 'counter'];
    const existingTables = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length === 0) {
      console.log('✅ 所有必需的表都已创建');
    } else {
      console.warn('⚠️  缺少以下表:', missingTables.join(', '));
    }

    // 5. 测试用户表查询
    console.log('\n5️⃣ 测试用户表查询...');
    try {
      const userCount = await client`SELECT COUNT(*) as count FROM users`;
      console.log(`✅ 用户表查询成功，当前用户数: ${userCount[0].count}`);
    } catch (error) {
      console.error('❌ 用户表查询失败:', error.message);
    }
  } catch (error) {
    console.error('❌ 数据库修复失败:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行修复
fixDatabase()
  .then(() => {
    console.log('\n🎉 数据库修复完成！');
    console.log('\n📝 后续步骤:');
    console.log('1. 重新部署应用到 Vercel');
    console.log('2. 测试预订页面功能');
    console.log('3. 检查 Vercel 日志确认错误已解决');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 修复过程中发生错误:', error.message);
    process.exit(1);
  });
