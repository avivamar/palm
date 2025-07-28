/**
 * Complete rebuild of palm_analysis_sessions table to match current schema
 * Since there are 0 records, we can safely recreate the table
 */

const { Pool } = require('pg');

async function rebuildTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase.com') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔧 Rebuilding palm_analysis_sessions table...');
    
    // Start transaction
    await pool.query('BEGIN');
    
    // Drop and recreate the table with correct structure
    await pool.query('DROP TABLE IF EXISTS palm_analysis_sessions CASCADE');
    
    console.log('✅ Dropped old table');
    
    // Create table with correct structure matching schema
    await pool.query(`
      CREATE TABLE palm_analysis_sessions (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        
        -- Dual hand image support
        left_hand_image_url TEXT,
        right_hand_image_url TEXT,
        image_metadata JSONB,
        
        status palm_analysis_status DEFAULT 'pending' NOT NULL,
        analysis_type palm_report_type DEFAULT 'quick' NOT NULL,
        
        -- Birth info for analysis
        birth_date DATE,
        birth_time TEXT,
        birth_location TEXT,
        
        -- Analysis results
        palm_features JSONB,
        analysis_result JSONB,
        processing_time INTEGER,
        
        -- Processing metadata
        processing_started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        
        -- Business metrics
        conversion_step TEXT DEFAULT 'uploaded',
        payment_intent_id TEXT,
        upgraded_at TIMESTAMP WITH TIME ZONE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    console.log('✅ Created new table with correct structure');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX idx_palm_sessions_user_id ON palm_analysis_sessions(user_id);
      CREATE INDEX idx_palm_sessions_status ON palm_analysis_sessions(status);
      CREATE INDEX idx_palm_sessions_created_at ON palm_analysis_sessions(created_at);
      CREATE INDEX idx_palm_sessions_analysis_type ON palm_analysis_sessions(analysis_type);
      CREATE INDEX idx_palm_sessions_conversion ON palm_analysis_sessions(conversion_step);
    `);
    
    console.log('✅ Created indexes');
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log('🎉 Table rebuild completed successfully!');
    
    // Verify new structure
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name='palm_analysis_sessions'
      ORDER BY ordinal_position
    `);
    
    console.log('\\n📋 New table structure:');
    console.table(columns.rows);
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Table rebuild failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

rebuildTable();