#!/usr/bin/env node

/**
 * 紧急修复脚本：创建缺失的 preorders 表
 * 解决 "relation preorders does not exist" 错误
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

async function fixPreordersTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost')
      ? false
      : {
          rejectUnauthorized: false,
        },
  });

  try {
    console.log('🔍 检查 preorders 表是否存在...');

    // 检查表是否存在
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'preorders'
      );
    `);

    const tableExists = checkResult.rows[0].exists;

    if (tableExists) {
      console.log('✅ preorders 表已存在，无需创建');
      return;
    }

    console.log('🚀 创建 preorders 表...');

    // 创建必要的枚举类型（如果不存在）
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE preorder_status AS ENUM('initiated', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE product_color AS ENUM('Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 创建 preorders 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS preorders (
        id text PRIMARY KEY NOT NULL,
        user_id text,
        email text NOT NULL,
        color product_color NOT NULL,
        price_id text NOT NULL,
        status preorder_status DEFAULT 'initiated' NOT NULL,
        session_id text,
        payment_intent_id text,
        amount numeric(10, 2) NOT NULL,
        currency text DEFAULT 'USD' NOT NULL,
        preorder_number text,
        locale text DEFAULT 'en',
        customer_notes text,
        estimated_delivery date,
        shipping_address jsonb,
        billing_address jsonb,
        billing_name text,
        billing_email text,
        billing_phone text,
        billing_address_line1 text,
        billing_address_line2 text,
        billing_city text,
        billing_state text,
        billing_country text,
        billing_postal_code text,
        discount_code text,
        discount_amount numeric(10, 2) DEFAULT '0',
        tax_amount numeric(10, 2) DEFAULT '0',
        shipping_cost numeric(10, 2) DEFAULT '0',
        tracking_number text,
        shipped_at timestamp with time zone,
        delivered_at timestamp with time zone,
        cancelled_at timestamp with time zone,
        cancellation_reason text,
        refunded_at timestamp with time zone,
        refund_amount numeric(10, 2),
        referrer_code text,
        share_nickname text,
        klaviyo_event_sent_at timestamp with time zone,
        updated_at timestamp with time zone DEFAULT now(),
        created_at timestamp with time zone DEFAULT now(),
        CONSTRAINT preorders_preorder_number_unique UNIQUE(preorder_number)
      );
    `);

    // 添加外键约束（如果 users 表存在）
    const usersTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (usersTableExists.rows[0].exists) {
      await pool.query(`
        ALTER TABLE preorders 
        ADD CONSTRAINT preorders_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      console.log('✅ 添加了与 users 表的外键约束');
    }

    console.log('✅ preorders 表创建成功！');

    // 验证表创建
    const verifyResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'preorders' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 preorders 表结构：');
    verifyResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 运行修复
if (require.main === module) {
  fixPreordersTable()
    .then(() => {
      console.log('🎉 修复完成！现在可以正常进行预购了。');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 修复失败:', error);
      process.exit(1);
    });
}

module.exports = { fixPreordersTable };
