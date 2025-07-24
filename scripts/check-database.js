const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  // Set SSL options to handle self-signed certificates
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔍 Checking database connection...');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    const usersTableExists = tableCheck.rows[0].exists;
    console.log(`📋 Users table exists: ${usersTableExists ? 'YES' : 'NO'}`);

    if (usersTableExists) {
      // Check users table structure
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users in database: ${userCount.rows[0].count}`);

      // Check for admin users
      const adminCheck = await client.query('SELECT email, role FROM users WHERE role = \'admin\'');
      console.log(`👑 Admin users: ${adminCheck.rows.length}`);
      adminCheck.rows.forEach((admin) => {
        console.log(`   - ${admin.email} (${admin.role})`);
      });

      // Check if our target admin exists
      const targetAdminEmail = process.env.ADMIN_EMAIL;
      if (targetAdminEmail) {
        const targetCheck = await client.query('SELECT email, role FROM users WHERE email = $1', [targetAdminEmail]);
        console.log(`🎯 Target admin (${targetAdminEmail}): ${targetCheck.rows.length ? 'EXISTS' : 'NOT FOUND'}`);
        if (targetCheck.rows.length > 0) {
          console.log(`   Role: ${targetCheck.rows[0].role}`);
        }
      }
    }

    // Check other important tables
    const tables = ['preorders', 'webhook_logs', 'marketing_campaigns'];
    for (const table of tables) {
      const check = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      console.log(`📋 ${table} table exists: ${check.rows[0].exists ? 'YES' : 'NO'}`);
    }

    // Check migration history
    const migrationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    if (migrationCheck.rows[0].exists) {
      const migrations = await client.query('SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at');
      console.log(`📦 Migrations applied: ${migrations.rows.length}`);
      migrations.rows.forEach((migration, i) => {
        console.log(`   ${i + 1}. ${migration.hash} - ${migration.created_at}`);
      });
    } else {
      console.log('📦 No migration history found');
    }

    client.release();
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase().catch(console.error);
