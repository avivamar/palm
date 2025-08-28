#!/usr/bin/env npx tsx

/**
 * Supabase Database Connection Test
 * Tests Supabase PostgreSQL connection with proper configuration
 */

import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('\n🔍 Testing Supabase Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    console.log('\nPlease ensure your .env.local contains:');
    console.log('DATABASE_URL="postgres://[user]:[password]@[host]:[port]/[database]?sslmode=require"');
    process.exit(1);
  }

  // Parse URL for debugging (hide password)
  const dbUrl = process.env.DATABASE_URL;
  const urlParts = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:\/]+):?(\d+)?\/(.+)/);
  
  if (urlParts) {
    console.log('📊 Connection Details:');
    console.log('  User:', urlParts[1]);
    console.log('  Host:', urlParts[3]);
    console.log('  Port:', urlParts[4] || '5432');
    console.log('  Database:', urlParts[5].split('?')[0]);
    console.log('  SSL:', dbUrl.includes('sslmode=require') ? 'Required' : 'Not specified');
  }

  // Alternative connection configurations to try
  const configs = [
    {
      name: 'Standard Connection',
      url: process.env.DATABASE_URL,
      options: {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      }
    },
    {
      name: 'With SSL Rejection Disabled',
      url: process.env.DATABASE_URL,
      options: {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 'require' : false,
      },
      setup: () => process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    },
    {
      name: 'Pooler Mode',
      url: process.env.DATABASE_URL.replace('6543', '5432'), // Try direct connection port
      options: {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      }
    }
  ];

  for (const config of configs) {
    console.log(`\n🔄 Trying: ${config.name}...`);
    
    let sql: postgres.Sql | null = null;
    
    try {
      // Run setup if provided
      if (config.setup) {
        config.setup();
      }

      // Create connection
      sql = postgres(config.url, config.options);

      // Test connection
      const result = await sql`SELECT version(), current_database(), now() as time`;
      
      console.log('✅ Connection successful!');
      console.log('  PostgreSQL:', result[0].version.split(' ')[1]);
      console.log('  Database:', result[0].current_database);
      console.log('  Server Time:', result[0].time);

      // Test table listing
      const tables = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        LIMIT 5
      `;

      if (tables.length > 0) {
        console.log(`  Tables found: ${tables.length} (showing first 5)`);
        tables.forEach(t => console.log(`    - ${t.tablename}`));
      } else {
        console.log('  ⚠️  No tables found in public schema');
        console.log('  Run migrations: npm run db:migrate');
      }

      // Success - close and exit
      await sql.end();
      console.log('\n✨ Database connection test passed!\n');
      return;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Failed: ${errorMsg}`);
      
      // Clean up connection
      if (sql) {
        try {
          await sql.end();
        } catch {}
      }
    }
  }

  // All attempts failed
  console.log('\n❌ All connection attempts failed!');
  console.log('\n📝 Troubleshooting steps:');
  console.log('1. Verify DATABASE_URL in .env.local is correct');
  console.log('2. Check if database is active in Supabase dashboard');
  console.log('3. Ensure you\'re using the correct connection string:');
  console.log('   - Use "Connection string" from Supabase Settings > Database');
  console.log('   - Should look like: postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require');
  console.log('4. Try both pooler (port 6543) and direct (port 5432) connections');
  console.log('5. Check if your IP is allowed in Supabase network restrictions');

  process.exit(1);
}

// Run test
testSupabaseConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});