/**
 * Manual migration script to fix dual hand columns
 * Addresses the "column left_hand_image_url does not exist" error
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔧 Applying dual hand columns migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/0008_fix_dual_hand_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    
    // Create required enums if they don't exist
    await pool.query(`
      DO $$ 
      BEGIN
          -- Create palm_analysis_status enum if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'palm_analysis_status') THEN
              CREATE TYPE palm_analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');
          END IF;
          
          -- Create palm_report_type enum if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'palm_report_type') THEN
              CREATE TYPE palm_report_type AS ENUM ('quick', 'full', 'premium');
          END IF;
      END $$;
    `);
    
    console.log('✅ Created required enums');

    // Add all missing columns
    await pool.query(`
      DO $$ 
      BEGIN
          -- Add analysis_type column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='analysis_type') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "analysis_type" palm_report_type DEFAULT 'quick' NOT NULL;
          END IF;
          
          -- Add status column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='status') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "status" palm_analysis_status DEFAULT 'pending' NOT NULL;
          END IF;
          
          -- Add birth_date column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='birth_date') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "birth_date" date;
          END IF;
          
          -- Add birth_time column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='birth_time') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "birth_time" text;
          END IF;
          
          -- Add birth_location column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='birth_location') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "birth_location" text;
          END IF;
          
          -- Add upgraded_at column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='upgraded_at') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "upgraded_at" timestamp with time zone;
          END IF;
          
          -- Add user_id column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='user_id') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "user_id" text;
          END IF;
          
          -- Add created_at column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='created_at') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "created_at" timestamp with time zone DEFAULT NOW() NOT NULL;
          END IF;
          
          -- Add updated_at column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='palm_analysis_sessions' AND column_name='updated_at') THEN
              ALTER TABLE "palm_analysis_sessions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT NOW();
          END IF;
      END $$;
    `);
    
    console.log('✅ Added all missing columns');
    
    // Verify columns exist
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'palm_analysis_sessions' 
      AND column_name IN ('left_hand_image_url', 'right_hand_image_url', 'image_metadata', 'analysis_result', 'analysis_type', 'status', 'birth_date', 'birth_time', 'birth_location', 'upgraded_at', 'user_id', 'created_at', 'updated_at')
      ORDER BY column_name;
    `);
    
    console.log('📋 Verified columns:', result.rows.map(row => row.column_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();