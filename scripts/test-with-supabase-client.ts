#!/usr/bin/env npx tsx

/**
 * Test database using Supabase client
 * This tests both Supabase Auth and Database connections
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

async function testSupabaseClient() {
  console.log('\n🔍 Testing Supabase Client Connection...\n');

  // Check required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('\nRequired in .env.local:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...');
    process.exit(1);
  }

  console.log('📊 Supabase Configuration:');
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Check if we can connect to Supabase
    console.log('\n1️⃣ Testing Supabase Auth Service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`  ⚠️ Auth Error: ${authError.message}`);
    } else {
      console.log('  ✅ Auth service is accessible');
      console.log(`  Session: ${authData.session ? 'Active' : 'No active session'}`);
    }

    // Test 2: Query a simple table (users table)
    console.log('\n2️⃣ Testing Database Access...');
    
    // Try to select from users table
    const { data: userData, error: userError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      if (userError.message.includes('relation') && userError.message.includes('does not exist')) {
        console.log('  ⚠️ Users table does not exist');
        console.log('  → Run migrations: npm run db:migrate');
      } else if (userError.message.includes('JWT')) {
        console.log('  ⚠️ JWT/Auth issue: Check your anon key');
      } else {
        console.log(`  ⚠️ Database Error: ${userError.message}`);
      }
    } else {
      console.log('  ✅ Database is accessible');
      console.log(`  Users table has ${count || 0} records`);
    }

    // Test 3: Check other tables
    console.log('\n3️⃣ Checking Available Tables...');
    
    const tables = ['preorders', 'palm_analysis_sessions', 'webhook_logs'];
    
    for (const table of tables) {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`  ✅ ${table}: ${count || 0} records`);
      } else if (error.message.includes('does not exist')) {
        console.log(`  ⚠️ ${table}: Table not found`);
      } else {
        console.log(`  ❌ ${table}: ${error.message}`);
      }
    }

    // Test 4: Test RLS (Row Level Security)
    console.log('\n4️⃣ Testing Row Level Security...');
    
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (rlsError) {
      if (rlsError.message.includes('Row Level Security')) {
        console.log('  ℹ️ RLS is enabled (good for security)');
        console.log('  → Authenticated requests will have appropriate access');
      } else {
        console.log(`  ⚠️ RLS Error: ${rlsError.message}`);
      }
    } else {
      console.log('  ✅ RLS allows public read or is disabled');
    }

    console.log('\n✅ Supabase client connection test completed!');
    
    // Provide connection string info
    console.log('\n📝 Connection String Info:');
    console.log('If you need the direct DATABASE_URL, get it from:');
    console.log('1. Supabase Dashboard → Settings → Database');
    console.log('2. Connection string → Connection Pooler');
    console.log('3. Mode: Transaction (for serverless)');
    console.log('4. Copy and replace [YOUR-PASSWORD]');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Check if your Supabase project is active');
    console.log('2. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('3. Check network connectivity to Supabase');
  }
}

// Run test
testSupabaseClient().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});