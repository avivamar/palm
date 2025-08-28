#!/usr/bin/env npx tsx

/**
 * Database Connection Diagnostics
 * Comprehensive test for Supabase database connection issues
 */

import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
config({ path: '.env.local' });

async function diagnoseDatabase() {
  console.log('\n🔬 Database Connection Diagnostics\n');
  console.log('=' .repeat(50));

  // 1. Check environment variables
  console.log('\n1️⃣ Environment Variables Check:');
  console.log('-'.repeat(30));
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL', 
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let envVarsOk = true;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
      if (envVar === 'DATABASE_URL') {
        // Parse and validate DATABASE_URL format
        const url = process.env[envVar]!;
        if (url.includes('supabase.com')) {
          console.log('   → Supabase host detected');
        }
        if (url.includes('sslmode=require')) {
          console.log('   → SSL mode: require');
        }
        if (url.includes('pooler')) {
          console.log('   → Using pooler connection');
        }
      }
    } else {
      console.log(`❌ ${envVar}: Not set`);
      envVarsOk = false;
    }
  }

  if (!envVarsOk) {
    console.log('\n⚠️ Missing environment variables!');
    console.log('Please check your .env.local file');
    return;
  }

  // 2. Parse DATABASE_URL
  console.log('\n2️⃣ DATABASE_URL Analysis:');
  console.log('-'.repeat(30));
  
  const dbUrl = process.env.DATABASE_URL!;
  
  // Extract components using regex
  const urlPattern = /postgres(?:ql)?:\/\/([^:]+)(?::([^@]+))?@([^:\/]+)(?::(\d+))?\/([^?]+)(?:\?(.+))?/;
  const match = dbUrl.match(urlPattern);
  
  if (match) {
    const [, user, password, host, port, database, params] = match;
    
    console.log(`User: ${user}`);
    console.log(`Password: ${password ? '***' + password.slice(-4) : 'Not provided'}`);
    console.log(`Host: ${host}`);
    console.log(`Port: ${port || '5432'}`);
    console.log(`Database: ${database}`);
    
    if (params) {
      console.log('Parameters:');
      const searchParams = new URLSearchParams(params);
      searchParams.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    // Check for common issues
    console.log('\n3️⃣ Common Issues Check:');
    console.log('-'.repeat(30));

    // Check if it's a pooler connection
    if (host.includes('pooler.supabase.com')) {
      console.log('✅ Using Supabase pooler (recommended)');
      if (port === '6543') {
        console.log('✅ Using correct pooler port (6543)');
      } else if (port === '5432') {
        console.log('⚠️ Port 5432 is for direct connection, not pooler. Try port 6543.');
      }
    } else if (host.includes('supabase.com')) {
      console.log('ℹ️ Using direct Supabase connection (not pooler)');
      if (port === '5432') {
        console.log('✅ Using correct direct port (5432)');
      } else if (port === '6543') {
        console.log('⚠️ Port 6543 is for pooler connection. Use 5432 for direct.');
      }
    }

    // Check SSL
    if (!params || !params.includes('sslmode')) {
      console.log('⚠️ No SSL mode specified. Add ?sslmode=require');
    }

    // Check user format
    if (user.includes('.')) {
      const [prefix, projectRef] = user.split('.');
      if (prefix === 'postgres' && projectRef) {
        console.log(`✅ User format looks correct (postgres.${projectRef})`);
      }
    } else {
      console.log('⚠️ User should be in format: postgres.[project-ref]');
    }
  } else {
    console.log('❌ Could not parse DATABASE_URL');
    console.log('Expected format: postgres://user:password@host:port/database?sslmode=require');
  }

  // 3. Test network connectivity
  console.log('\n4️⃣ Network Connectivity Test:');
  console.log('-'.repeat(30));
  
  if (match) {
    const host = match[3];
    const port = match[4] || '5432';
    
    try {
      // Test DNS resolution
      const { stdout } = await execAsync(`nslookup ${host}`);
      if (stdout.includes('Address:')) {
        console.log(`✅ DNS resolution successful for ${host}`);
      }
    } catch (error) {
      console.log(`❌ DNS resolution failed for ${host}`);
    }

    // Test port connectivity using nc (netcat) if available
    try {
      await execAsync(`nc -zv ${host} ${port}`, { timeout: 5000 });
      console.log(`✅ Port ${port} is reachable on ${host}`);
    } catch (error) {
      // nc might not be available, try telnet
      try {
        await execAsync(`echo | telnet ${host} ${port}`, { timeout: 5000 });
        console.log(`✅ Port ${port} is reachable on ${host}`);
      } catch {
        console.log(`⚠️ Could not verify port ${port} connectivity (tools not available)`);
      }
    }
  }

  // 4. Provide solution
  console.log('\n5️⃣ Recommended Actions:');
  console.log('-'.repeat(30));
  
  console.log(`
1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the "Connection string" from the Connection Pooler section
4. Make sure to use:
   - Mode: Transaction
   - Port: 6543 (for pooler)
5. Replace [YOUR-PASSWORD] with your database password
6. Update your .env.local file with the correct DATABASE_URL

Example format:
DATABASE_URL="postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

Alternative (direct connection):
DATABASE_URL="postgres://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
`);

  // 5. Check if running locally vs production
  console.log('\n6️⃣ Environment Check:');
  console.log('-'.repeat(30));
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`VERCEL: ${process.env.VERCEL || 'not set'}`);
  console.log(`Local Development: ${!process.env.VERCEL ? 'Yes' : 'No'}`);
}

// Run diagnostics
diagnoseDatabase().catch(error => {
  console.error('Diagnostic error:', error);
});