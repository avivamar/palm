const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');

async function addSessionUUID() {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    console.log('Connecting to database...');
    const sql = postgres(connectionString, { max: 1 });
    
    // 添加 session_id 列
    console.log('Adding session_id column...');
    await sql`
      ALTER TABLE palm_analysis_sessions 
      ADD COLUMN IF NOT EXISTS session_id VARCHAR(36) UNIQUE;
    `;
    
    // 为现有记录生成 UUID
    console.log('Generating UUIDs for existing records...');
    const existingSessions = await sql`
      SELECT id FROM palm_analysis_sessions WHERE session_id IS NULL;
    `;
    
    for (const session of existingSessions) {
      const sessionId = uuidv4();
      await sql`
        UPDATE palm_analysis_sessions 
        SET session_id = ${sessionId} 
        WHERE id = ${session.id};
      `;
      console.log(`Updated session ${session.id} with UUID: ${sessionId}`);
    }
    
    // 设置列为 NOT NULL
    console.log('Setting session_id as NOT NULL...');
    await sql`
      ALTER TABLE palm_analysis_sessions 
      ALTER COLUMN session_id SET NOT NULL;
    `;
    
    console.log('✅ Session UUID migration completed successfully');
    
    await sql.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error in session UUID migration:', error);
    process.exit(1);
  }
}

addSessionUUID();