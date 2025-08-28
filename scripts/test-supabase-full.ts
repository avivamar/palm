#!/usr/bin/env npx tsx

/**
 * Comprehensive Supabase Test
 * Tests Database connection, Auth service, and Google OAuth configuration
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

async function testSupabaseComplete() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}   🔍 SUPABASE COMPREHENSIVE TEST${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // ========================================
  // 1. ENVIRONMENT VARIABLES CHECK
  // ========================================
  console.log(`${colors.blue}[1/5] ENVIRONMENT VARIABLES${colors.reset}`);
  console.log('-'.repeat(40));

  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  };

  let allEnvSet = true;
  for (const [key, value] of Object.entries(env)) {
    if (value) {
      if (key.includes('KEY') || key.includes('SECRET')) {
        log('✅', `${key}: ${value.substring(0, 20)}...`, colors.green);
      } else if (key === 'DATABASE_URL') {
        const url = value;
        const masked = url.replace(/:([^@]+)@/, ':****@');
        log('✅', `${key}: ${masked}`, colors.green);
      } else {
        log('✅', `${key}: ${value}`, colors.green);
      }
    } else {
      log('❌', `${key}: Not set`, colors.red);
      allEnvSet = false;
    }
  }

  if (!allEnvSet) {
    log('⚠️', 'Some environment variables are missing!', colors.yellow);
  }

  // ========================================
  // 2. DATABASE CONNECTION TEST
  // ========================================
  console.log(`\n${colors.blue}[2/5] DATABASE CONNECTION${colors.reset}`);
  console.log('-'.repeat(40));

  if (env.DATABASE_URL) {
    let sql: postgres.Sql | null = null;
    try {
      // Set SSL environment
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      
      sql = postgres(env.DATABASE_URL, {
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      const start = Date.now();
      const result = await sql`SELECT version(), current_database(), current_user, now() as time`;
      const duration = Date.now() - start;

      log('✅', `Connected in ${duration}ms`, colors.green);
      log('📊', `PostgreSQL: ${result[0].version.split(' ')[1]}`);
      log('📊', `Database: ${result[0].current_database}`);
      log('📊', `User: ${result[0].current_user}`);

      // Check tables
      const tables = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
        LIMIT 10
      `;

      if (tables.length > 0) {
        log('📋', `Tables found (${tables.length}):`, colors.green);
        tables.forEach(t => console.log(`    - ${t.tablename}`));
      } else {
        log('⚠️', 'No tables found. Run migrations: npm run db:migrate', colors.yellow);
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      log('❌', `Connection failed: ${msg}`, colors.red);
      
      if (msg.includes('Tenant or user not found')) {
        console.log(`\n  ${colors.yellow}→ Solution: Check your database password in .env.local`);
        console.log(`  → Get correct password from Supabase Dashboard > Settings > Database${colors.reset}`);
      }
    } finally {
      if (sql) await sql.end();
    }
  } else {
    log('⚠️', 'DATABASE_URL not configured', colors.yellow);
  }

  // ========================================
  // 3. SUPABASE CLIENT TEST
  // ========================================
  console.log(`\n${colors.blue}[3/5] SUPABASE CLIENT${colors.reset}`);
  console.log('-'.repeat(40));

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test Auth service
    try {
      const { data: session, error } = await supabase.auth.getSession();
      if (error) {
        log('❌', `Auth error: ${error.message}`, colors.red);
      } else {
        log('✅', 'Auth service accessible', colors.green);
        log('👤', `Session: ${session.session ? 'Active' : 'None'}`);
      }
    } catch (error) {
      log('❌', `Auth test failed: ${error}`, colors.red);
    }

    // Test database via Supabase client
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist')) {
          log('⚠️', 'Users table not found', colors.yellow);
        } else {
          log('❌', `Database query error: ${error.message}`, colors.red);
        }
      } else {
        log('✅', `Users table accessible (${count || 0} records)`, colors.green);
      }
    } catch (error) {
      log('❌', `Database test failed: ${error}`, colors.red);
    }
  } else {
    log('⚠️', 'Supabase client not configured', colors.yellow);
  }

  // ========================================
  // 4. GOOGLE OAUTH CONFIGURATION
  // ========================================
  console.log(`\n${colors.blue}[4/5] GOOGLE OAUTH SETUP${colors.reset}`);
  console.log('-'.repeat(40));

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
      // Check if Google provider is configured
      log('🔍', 'Checking Google OAuth configuration...');
      
      // Get OAuth URL for Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        log('❌', `Google OAuth error: ${error.message}`, colors.red);
      } else if (data?.url) {
        log('✅', 'Google OAuth is configured', colors.green);
        log('🔗', `OAuth URL generated successfully`);
        
        // Parse OAuth URL to check configuration
        const oauthUrl = new URL(data.url);
        if (oauthUrl.hostname === 'accounts.google.com') {
          log('✅', 'Google OAuth endpoint correct', colors.green);
        }
      } else {
        log('⚠️', 'Google OAuth may not be configured properly', colors.yellow);
      }

      // Check redirect URLs
      console.log(`\n  ${colors.cyan}Redirect URL Configuration:${colors.reset}`);
      console.log('  Add these to Google Cloud Console:');
      console.log(`  • ${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`);
      console.log('  Add these to Supabase Auth settings:');
      console.log('  • http://localhost:3000/auth/callback');
      console.log('  • https://yourdomain.com/auth/callback');

    } catch (error) {
      log('❌', `OAuth test failed: ${error}`, colors.red);
    }
  }

  // ========================================
  // 5. AUTH INTEGRATION CHECK
  // ========================================
  console.log(`\n${colors.blue}[5/5] AUTH INTEGRATION${colors.reset}`);
  console.log('-'.repeat(40));

  // Check for auth-related files
  const authFiles = [
    'src/app/auth/callback/route.ts',
    'src/app/(auth)/sign-in/page.tsx',
    'src/app/(auth)/sign-up/page.tsx',
    'src/components/auth/GoogleSignInButton.tsx',
  ];

  const fs = await import('fs');
  for (const file of authFiles) {
    const exists = fs.existsSync(file);
    if (exists) {
      log('✅', `Found: ${file}`, colors.green);
    } else {
      log('⚠️', `Missing: ${file}`, colors.yellow);
    }
  }

  // ========================================
  // SUMMARY AND RECOMMENDATIONS
  // ========================================
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}   📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.magenta}Required Setup Steps:${colors.reset}`);
  console.log('\n1. Database Connection:');
  console.log('   • Get connection string from Supabase Dashboard');
  console.log('   • Settings → Database → Connection Pooler');
  console.log('   • Use Transaction mode, port 6543');
  console.log('   • Replace [YOUR-PASSWORD] with actual password');
  
  console.log('\n2. Google OAuth Setup:');
  console.log('   • Enable in Supabase Dashboard → Authentication → Providers');
  console.log('   • Add Google Client ID and Secret');
  console.log('   • Configure redirect URLs in Google Cloud Console');
  
  console.log('\n3. Environment Variables (.env.local):');
  console.log('   DATABASE_URL="postgres://..."');
  console.log('   NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."');
  console.log('   NEXT_PUBLIC_GOOGLE_CLIENT_ID="[your-client-id].apps.googleusercontent.com"');
  
  console.log('\n4. Auth Callback Route:');
  console.log('   Create: src/app/auth/callback/route.ts');
  console.log('   This handles OAuth redirects');

  console.log(`\n${colors.cyan}Need help? Check DATABASE_SETUP.md for detailed instructions.${colors.reset}\n`);
}

// Run test
testSupabaseComplete().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});