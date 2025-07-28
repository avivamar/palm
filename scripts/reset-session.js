const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');

// Database schema
const { pgTable, serial, varchar, timestamp, text, integer } = require('drizzle-orm/pg-core');

const palmAnalysisSessionsSchema = pgTable('palm_analysis_sessions', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 50 }),
});

async function resetSession(sessionId) {
  try {
    // Create connection using environment variable
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    console.log('Connecting to database...');
    const sql = postgres(connectionString, { 
      max: 1,
      transform: {
        undefined: null
      }
    });
    
    const db = drizzle(sql, { logger: false });
    
    console.log(`Resetting session ${sessionId} to 'pending' status...`);
    
    const result = await db
      .update(palmAnalysisSessionsSchema)
      .set({ status: 'pending' })
      .where(eq(palmAnalysisSessionsSchema.id, sessionId));
    
    console.log('Session reset successfully');
    
    await sql.end();
    process.exit(0);
    
  } catch (error) {
    console.error('Error resetting session:', error);
    process.exit(1);
  }
}

const sessionId = process.argv[2] || 4;
resetSession(parseInt(sessionId));