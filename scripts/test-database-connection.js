#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function testConnection() {
  console.log('🔧 Testing database connection...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found');
    return;
  }

  console.log('📡 DATABASE_URL:', dbUrl.replace(/:[^:@]*@/, ':***@'));

  // Set SSL environment
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    // Test with different connection configs
    const configs = [
      { name: 'Default config', config: {} },
      { name: 'SSL disabled', config: { ssl: false } },
      { name: 'SSL required but no verify', config: { ssl: 'require', sslmode: 'require' } },
      { name: 'Connection pool config', config: { max: 1, idle_timeout: 20, connect_timeout: 10 } },
    ];

    for (const { name, config } of configs) {
      try {
        console.log(`\n🔍 Testing: ${name}`);
        const sql = postgres(dbUrl, config);

        const result = await sql`SELECT 1 as test, current_database() as db_name`;
        console.log(`✅ ${name}: Success`, result[0]);

        // Test if preorders table exists
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'preorders'
          ) as exists
        `;
        console.log(`📋 preorders table exists:`, tableCheck[0].exists);

        await sql.end();
        console.log(`✅ ${name}: Connection closed cleanly`);
        break; // Use the first working config
      } catch (error) {
        console.error(`❌ ${name}: Failed -`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ All connection attempts failed:', error);
  }
}

if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
