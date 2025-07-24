import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { adminAccessMiddleware } from '@/libs/admin-access-control';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';
import { usersSchema } from '@/models/Schema';

export async function POST(request: NextRequest) {
  return adminAccessMiddleware(request, async () => {
    return securityMiddleware(request, async () => {
      try {
        if (!isSupabaseConfigured) {
          return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // Get current session
        const supabase = await createServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          return NextResponse.json({ error: 'No session' }, { status: 401 });
        }

        const currentUser = {
          id: session.user.id,
          email: session.user.email,
        };

        if (!currentUser.email) {
          return NextResponse.json({ error: 'No email in session' }, { status: 400 });
        }

        const db = await getDB();

        // First, check if user exists by email
        const existingUser = await db
          .select()
          .from(usersSchema)
          .where(eq(usersSchema.email, currentUser.email))
          .limit(1);

        if (existingUser.length === 0) {
          return NextResponse.json({
            error: 'User not found by email',
            email: currentUser.email,
          }, { status: 404 });
        }

        const user = existingUser[0];

        // Update the user's supabaseId to match current session
        const updateResult = await db
          .update(usersSchema)
          .set({
            supabaseId: currentUser.id,
            authSource: 'supabase',
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(usersSchema.email, currentUser.email))
          .returning({
            id: usersSchema.id,
            email: usersSchema.email,
            role: usersSchema.role,
            supabaseId: usersSchema.supabaseId,
          });

        // Verify the update worked
        const verifyUser = await db
          .select()
          .from(usersSchema)
          .where(eq(usersSchema.supabaseId, currentUser.id))
          .limit(1);

        return NextResponse.json({
          success: true,
          message: 'User matching fixed successfully',
          before: {
            id: user.id,
            email: user.email,
            role: user.role,
            supabaseId: user.supabaseId,
          },
          after: updateResult[0],
          verification: {
            canFindBySupabaseId: verifyUser.length > 0,
            verifiedUser: verifyUser[0] || null,
          },
        });
      } catch (error) {
        console.error('Fix user match error:', error);
        return NextResponse.json({
          error: 'Fix failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    });
  });
}
