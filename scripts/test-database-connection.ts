#!/usr/bin/env npx tsx

/**
 * Database Connection Test Script
 * Tests both local and production database connections
 */

import { config } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/models/Schema';

// Load environment variables
config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  debug: (msg: string) => console.log(`${colors.gray}  ${msg}${colors.reset}`),
};

async function testDatabaseConnection() {
  console.log(`\n${colors.cyan}=== Database Connection Test ===${colors.reset}\n`);

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL is not set in environment variables');
    log.info('Please set DATABASE_URL in .env.local file');
    process.exit(1);
  }

  // Parse and display connection info (hiding sensitive data)
  const url = new URL(process.env.DATABASE_URL);
  log.info(`Database Host: ${url.hostname}`);
  log.info(`Database Port: ${url.port || '5432'}`);
  log.info(`Database Name: ${url.pathname.substring(1)}`);
  log.info(`Database User: ${url.username}`);
  log.debug(`SSL Mode: ${url.searchParams.get('sslmode') || 'require'}`);

  // Test connection
  let sql: postgres.Sql | null = null;
  let db: any = null;

  try {
    log.info('Attempting to connect to database...');

    // Create connection with timeout
    sql = postgres(process.env.DATABASE_URL, {
      connect_timeout: 10,
      max: 1,
      idle_timeout: 30,
      prepare: false,
    });

    // Test basic connection
    const startTime = Date.now();
    const result = await sql`SELECT version(), current_database(), current_user, now() as server_time`;
    const connectionTime = Date.now() - startTime;

    log.success(`Connected successfully in ${connectionTime}ms`);
    log.debug(`PostgreSQL Version: ${result[0].version}`);
    log.debug(`Current Database: ${result[0].current_database}`);
    log.debug(`Current User: ${result[0].current_user}`);
    log.debug(`Server Time: ${result[0].server_time}`);

    // Test Drizzle ORM connection
    log.info('Testing Drizzle ORM connection...');
    db = drizzle(sql, { schema });

    // Test table access
    log.info('Testing table access...');
    
    // Check users table
    try {
      const userCount = await db.select({ count: sql`count(*)::int` })
        .from(schema.usersSchema)
        .limit(1);
      log.success(`Users table accessible (${userCount[0]?.count || 0} records)`);
    } catch (error) {
      log.warning(`Users table not accessible or empty: ${error instanceof Error ? error.message : error}`);
    }

    // Check preorders table
    try {
      const preorderCount = await db.select({ count: sql`count(*)::int` })
        .from(schema.preordersSchema)
        .limit(1);
      log.success(`Preorders table accessible (${preorderCount[0]?.count || 0} records)`);
    } catch (error) {
      log.warning(`Preorders table not accessible or empty: ${error instanceof Error ? error.message : error}`);
    }

    // Check palm_analysis_sessions table
    try {
      const palmSessionCount = await db.select({ count: sql`count(*)::int` })
        .from(schema.palmAnalysisSessionsSchema)
        .limit(1);
      log.success(`Palm analysis sessions table accessible (${palmSessionCount[0]?.count || 0} records)`);
    } catch (error) {
      log.warning(`Palm analysis sessions table not accessible or empty: ${error instanceof Error ? error.message : error}`);
    }

    // List all tables
    log.info('Listing all tables in database...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    if (tables.length > 0) {
      log.success(`Found ${tables.length} tables:`);
      tables.forEach(table => log.debug(`  - ${table.tablename}`));
    } else {
      log.warning('No tables found in public schema');
    }

    // Test write operation (optional - commented out by default)
    /*
    log.info('Testing write operation...');
    const testWrite = await sql`
      INSERT INTO test_table (test_column) 
      VALUES ('test_value_' || now()::text) 
      RETURNING *
    `;
    log.success('Write operation successful');
    */

    console.log(`\n${colors.green}✅ Database connection test completed successfully!${colors.reset}\n`);

  } catch (error) {
    console.error(`\n${colors.red}❌ Database connection test failed!${colors.reset}\n`);
    
    if (error instanceof Error) {
      log.error(`Error: ${error.message}`);
      
      // Provide specific troubleshooting tips
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        log.warning('Unable to resolve database host. Check your DATABASE_URL.');
      } else if (error.message.includes('ECONNREFUSED')) {
        log.warning('Connection refused. Database might be down or port is blocked.');
      } else if (error.message.includes('password authentication failed')) {
        log.warning('Authentication failed. Check your database credentials.');
      } else if (error.message.includes('SSL')) {
        log.warning('SSL connection issue. You may need to add ?sslmode=require to your DATABASE_URL.');
      } else if (error.message.includes('timeout')) {
        log.warning('Connection timeout. Database might be slow or unreachable.');
      }
    } else {
      log.error(`Error: ${error}`);
    }

    process.exit(1);
  } finally {
    // Clean up connection
    if (sql) {
      log.info('Closing database connection...');
      await sql.end();
      log.success('Connection closed');
    }
  }
}

// Run test
testDatabaseConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});