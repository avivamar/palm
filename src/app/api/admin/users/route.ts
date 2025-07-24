import type { NextRequest } from 'next/server';
import type { AdminUser } from '@/middleware/admin-auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { hasAdminPermission, logAdminAction } from '@/middleware/admin-auth';
import { securityMiddleware } from '@/middleware/security/unified-security';
import { usersSchema } from '@/models/Schema';

async function handleGET(request: NextRequest, user: AdminUser) {
  try {
    // Log admin action for audit
    logAdminAction(user, 'READ', 'users_list');

    // Check read permissions
    if (!hasAdminPermission(user, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const db = await getDB();

    // Build query conditions
    let query = db.select().from(usersSchema);

    // Add search filter if provided
    if (search) {
      const { or, ilike } = await import('drizzle-orm');
      query = query.where(or(
        ilike(usersSchema.email, `%${search}%`),
        ilike(usersSchema.displayName, `%${search}%`),
      ));
    }

    // Add role filter if provided
    if (role && ['customer', 'admin', 'moderator'].includes(role)) {
      query = query.where(eq(usersSchema.role, role as 'customer' | 'admin' | 'moderator'));
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const users = await query;

    // Get total count for pagination
    const { count } = await import('drizzle-orm');
    let countQuery = db.select({ count: count() }).from(usersSchema);
    if (search) {
      const { or, ilike } = await import('drizzle-orm');
      countQuery = countQuery.where(or(
        ilike(usersSchema.email, `%${search}%`),
        ilike(usersSchema.displayName, `%${search}%`),
      ));
    }
    if (role && ['customer', 'admin', 'moderator'].includes(role)) {
      countQuery = countQuery.where(eq(usersSchema.role, role as 'customer' | 'admin' | 'moderator'));
    }

    const [{ count: totalCount }] = await countQuery;

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async () => {
    try {
      // Verify admin access
      if (!isSupabaseConfigured) {
        return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
      }

      const supabase = await createServerClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { email, displayName, role = 'customer' } = body;

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const db = await getDB();

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 },
        );
      }

      // Create new user
      const newUser = await db
        .insert(usersSchema)
        .values({
          email,
          displayName,
          role: role as 'customer' | 'admin' | 'moderator',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({ user: newUser[0] }, { status: 201 });
    } catch (error) {
      console.error('Failed to create user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      );
    }
  });
}

export async function GET(request: NextRequest) {
  return securityMiddleware(request, async () => {
    try {
      // Verify admin access using proper authentication
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: 'Authentication service not available' },
          { status: 503 },
        );
      }

      const supabase = await createServerClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      // Check if user is admin
      const { getUserRoleByEmail } = await import('@/app/actions/userActions');
      const roleResult = await getUserRoleByEmail(userEmail);

      if (!roleResult.success || roleResult.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const adminUser: AdminUser = {
        id: session.user.id,
        email: userEmail,
        role: 'admin',
        supabaseId: session.user.id,
      };

      return handleGET(request, adminUser);
    } catch (error) {
      console.error('Admin users API authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 },
      );
    }
  });
}
