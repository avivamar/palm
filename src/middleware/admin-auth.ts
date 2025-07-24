/**
 * Admin API Authentication Middleware
 * Following CLAUDE.md: 安全性优先，最小权限原则
 */

import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { usersSchema } from '@/models/Schema';

/**
 * Admin authentication error types
 */
export class AdminAuthError extends Error {
  constructor(
    message: string,
    public code: 'NO_SESSION' | 'INVALID_USER' | 'INSUFFICIENT_PERMISSIONS' | 'SERVICE_UNAVAILABLE',
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Admin user interface
 */
export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'moderator';
  supabaseId: string;
};

/**
 * Verify admin authentication and authorization
 */
export async function verifyAdminAuth(_request: NextRequest): Promise<AdminUser> {
  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    throw new AdminAuthError(
      'Authentication service not available',
      'SERVICE_UNAVAILABLE',
      503,
    );
  }

  // Get user session from Supabase
  const supabase = await createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.user) {
    throw new AdminAuthError(
      'No valid session found',
      'NO_SESSION',
      401,
    );
  }

  // Get user from database with role information
  const db = await getDB();
  const users = await db
    .select({
      id: usersSchema.id,
      email: usersSchema.email,
      role: usersSchema.role,
      supabaseId: usersSchema.supabaseId,
    })
    .from(usersSchema)
    .where(eq(usersSchema.supabaseId, session.user.id))
    .limit(1);

  const user = users[0];
  if (!user) {
    throw new AdminAuthError(
      'User not found in database',
      'INVALID_USER',
      404,
    );
  }

  // Check admin permissions
  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new AdminAuthError(
      'Insufficient permissions for admin access',
      'INSUFFICIENT_PERMISSIONS',
      403,
    );
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as 'admin' | 'moderator',
    supabaseId: user.supabaseId!,
  };
}

/**
 * Admin authentication middleware wrapper
 * Use this to wrap admin API route handlers
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, user: AdminUser, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = await verifyAdminAuth(request);
      return await handler(request, user, ...args);
    } catch (error) {
      if (error instanceof AdminAuthError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString(),
          },
          { status: error.statusCode },
        );
      }

      // Log unexpected errors but don't expose details
      console.error('Unexpected admin auth error:', error);
      return NextResponse.json(
        {
          error: 'Internal authentication error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Role-based access control helper
 */
export function requireRole(allowedRoles: ('admin' | 'moderator')[]) {
  return (user: AdminUser): boolean => {
    return allowedRoles.includes(user.role);
  };
}

/**
 * Check if user has specific admin permissions
 */
export function hasAdminPermission(user: AdminUser, permission: 'read' | 'write' | 'delete'): boolean {
  if (user.role === 'admin') {
    return true; // Admin has all permissions
  }

  if (user.role === 'moderator') {
    // Moderators only have read and write permissions
    return permission === 'read' || permission === 'write';
  }

  return false;
}

/**
 * Audit log for admin actions
 */
export function logAdminAction(
  user: AdminUser,
  action: string,
  resource: string,
  details?: Record<string, any>,
): void {
  // Log admin actions for security audit
  console.log(JSON.stringify({
    type: 'ADMIN_ACTION',
    timestamp: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    action,
    resource,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  }));
}
