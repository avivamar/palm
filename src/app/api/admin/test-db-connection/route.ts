import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { usersSchema } from '@/models/Schema';

export async function GET() {
  try {
    console.log('[DB Test] Starting database connection test...');

    // Test database connection
    const db = await getDB();
    console.log('[DB Test] Database instance obtained');

    // Test basic query
    try {
      console.log('[DB Test] Testing basic query...');
      const testQuery = await db.execute('SELECT 1 as test');
      console.log('[DB Test] Basic query successful:', testQuery);
    } catch (basicError) {
      console.error('[DB Test] Basic query failed:', basicError);
      return NextResponse.json({
        error: 'Basic query failed',
        details: basicError instanceof Error ? basicError.message : 'Unknown error',
        type: 'basic_query_error',
      }, { status: 500 });
    }

    // Test users table exists
    try {
      console.log('[DB Test] Testing users table...');
      const userCount = await db.execute('SELECT COUNT(*) FROM users');
      console.log('[DB Test] Users table query successful:', userCount);
    } catch (tableError) {
      console.error('[DB Test] Users table error:', tableError);
      return NextResponse.json({
        error: 'Users table not accessible',
        details: tableError instanceof Error ? tableError.message : 'Unknown error',
        type: 'table_access_error',
        suggestion: 'Check if database migrations have been run',
      }, { status: 500 });
    }

    // Test user role query
    try {
      console.log('[DB Test] Testing user role query...');
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const userRole = await db
          .select({ email: usersSchema.email, role: usersSchema.role })
          .from(usersSchema)
          .where(eq(usersSchema.email, adminEmail))
          .limit(1);

        console.log('[DB Test] User role query successful:', userRole);

        return NextResponse.json({
          success: true,
          message: 'Database connection successful',
          dbType: process.env.DATABASE_URL ? 'PostgreSQL' : 'PGlite',
          adminEmail,
          userFound: userRole.length > 0,
          userRole: userRole[0]?.role || null,
          results: {
            basicQuery: 'OK',
            usersTable: 'OK',
            roleQuery: 'OK',
          },
        });
      } else {
        return NextResponse.json({
          error: 'ADMIN_EMAIL not configured',
          type: 'config_error',
        }, { status: 400 });
      }
    } catch (roleError) {
      console.error('[DB Test] Role query failed:', roleError);
      return NextResponse.json({
        error: 'Role query failed',
        details: roleError instanceof Error ? roleError.message : 'Unknown error',
        type: 'role_query_error',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[DB Test] Database connection failed:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: 'connection_error',
    }, { status: 500 });
  }
}
