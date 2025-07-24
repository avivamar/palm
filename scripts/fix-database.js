#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');

  // Parse DATABASE_URL to fix the format issue
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  // Clean up the URL - remove the supa=base-pooler.x parameter that's causing issues
  const cleanDbUrl = dbUrl.replace('&supa=base-pooler.x', '');
  console.log('📡 Connecting to database...');

  // Set environment variable to ignore SSL certificates
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const client = new Client({
    connectionString: cleanDbUrl,
    ssl: false,
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully');

    // Check if preorders table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'preorders'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✅ preorders table already exists');
    } else {
      console.log('❌ preorders table does not exist, creating...');

      // Run the creation SQL from our migration
      const createPreordersSql = `
        -- Create enum types if they don't exist
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
        
        -- Create users table if it doesn't exist
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          display_name TEXT,
          photo_url TEXT,
          role TEXT DEFAULT 'customer' NOT NULL,
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
        
        -- Create preorders table
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
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
        CREATE INDEX IF NOT EXISTS idx_preorders_email ON preorders(email);
        CREATE INDEX IF NOT EXISTS idx_preorders_status ON preorders(status);
        CREATE INDEX IF NOT EXISTS idx_preorders_user_id ON preorders(user_id);
      `;

      await client.query(createPreordersSql);
      console.log('✅ preorders table created successfully');
    }

    // Verify table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'preorders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log(`✅ preorders table has ${tableInfo.rows.length} columns`);
    console.log('🎉 Database schema fix completed successfully!');
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  fixDatabase();
}

module.exports = { fixDatabase };
