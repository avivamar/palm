/**
 * Subscription Database Setup Script
 * Safely sets up subscription tables without conflicting with existing migrations
 */

import { config } from 'dotenv';
import { Client } from 'pg';

// Load environment variables
config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupSubscriptionDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if subscription enums already exist
    const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'subscription_status'
      ) as exists;
    `);

    if (!enumCheck.rows[0].exists) {
      console.log('Creating subscription enums...');

      await client.query(`
        CREATE TYPE subscription_status AS ENUM(
          'active', 'canceled', 'incomplete', 'incomplete_expired', 
          'past_due', 'trialing', 'unpaid'
        );
      `);

      await client.query(`
        CREATE TYPE subscription_plan AS ENUM(
          'free', 'basic', 'pro', 'premium'
        );
      `);

      await client.query(`
        CREATE TYPE usage_resource AS ENUM(
          'chat_messages', 'ai_calls', 'api_requests', 'storage_mb'
        );
      `);

      console.log('✅ Created subscription enums');
    } else {
      console.log('⏭️ Subscription enums already exist');
    }

    // Check if users table has subscription columns
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'subscription_status';
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Adding subscription columns to users table...');

      await client.query(`
        ALTER TABLE users 
        ADD COLUMN subscription_status subscription_status DEFAULT 'active',
        ADD COLUMN subscription_plan subscription_plan DEFAULT 'free',
        ADD COLUMN subscription_period_end timestamp with time zone;
      `);

      console.log('✅ Added subscription columns to users table');
    } else {
      console.log('⏭️ Users table subscription columns already exist');
    }

    // Check if subscriptions table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'subscriptions'
      ) as exists;
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating subscriptions table...');

      await client.query(`
        CREATE TABLE subscriptions (
          id text PRIMARY KEY,
          user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          stripe_subscription_id text NOT NULL UNIQUE,
          stripe_customer_id text NOT NULL,
          stripe_price_id text NOT NULL,
          plan_id subscription_plan NOT NULL,
          status subscription_status NOT NULL,
          current_period_start timestamp with time zone NOT NULL,
          current_period_end timestamp with time zone NOT NULL,
          cancel_at_period_end boolean DEFAULT false,
          canceled_at timestamp with time zone,
          trial_start timestamp with time zone,
          trial_end timestamp with time zone,
          metadata jsonb,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          updated_at timestamp with time zone DEFAULT now()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
        CREATE UNIQUE INDEX idx_subscriptions_stripe_id ON subscriptions (stripe_subscription_id);
        CREATE INDEX idx_subscriptions_status ON subscriptions (status);
        CREATE INDEX idx_subscriptions_plan_status ON subscriptions (plan_id, status);
      `);

      console.log('✅ Created subscriptions table with indexes');
    } else {
      console.log('⏭️ Subscriptions table already exists');
    }

    // Check if subscription_usage table exists
    const usageTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'subscription_usage'
      ) as exists;
    `);

    if (!usageTableCheck.rows[0].exists) {
      console.log('Creating subscription_usage table...');

      await client.query(`
        CREATE TABLE subscription_usage (
          id serial PRIMARY KEY,
          user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          subscription_id text REFERENCES subscriptions(id) ON DELETE SET NULL ON UPDATE CASCADE,
          resource_type usage_resource NOT NULL,
          usage_count integer DEFAULT 0 NOT NULL,
          limit_count integer NOT NULL,
          period_start timestamp with time zone NOT NULL,
          period_end timestamp with time zone NOT NULL,
          reset_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT now() NOT NULL,
          updated_at timestamp with time zone DEFAULT now()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_usage_user_resource ON subscription_usage (user_id, resource_type);
        CREATE INDEX idx_usage_period ON subscription_usage (period_start, period_end);
        CREATE INDEX idx_usage_reset_at ON subscription_usage (reset_at);
        CREATE INDEX idx_usage_subscription_id ON subscription_usage (subscription_id);
      `);

      console.log('✅ Created subscription_usage table with indexes');
    } else {
      console.log('⏭️ Subscription_usage table already exists');
    }

    console.log('🎉 Subscription database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up subscription database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
setupSubscriptionDatabase();
