import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/app/actions/userActions';
import { adminAccessMiddleware } from '@/libs/admin-access-control';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';
import { usersSchema } from '@/models/Schema';

export async function POST(request: NextRequest) {
  return adminAccessMiddleware(request, async () => {
    return securityMiddleware(request, async () => {
      try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured) {
          return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // Get current session
        const supabase = await createServerClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          return NextResponse.json({ error: 'No authenticated session' }, { status: 401 });
        }

        const email = session.user.email;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!email) {
          return NextResponse.json({ error: 'User has no email' }, { status: 400 });
        }

        // Check if user is supposed to be admin
        const isAdminEmail = adminEmail && email === adminEmail;

        // Sync user to database with correct role
        const syncResult = await syncUserToDatabase({
          id: session.user.id,
          email,
          displayName: session.user.user_metadata?.name || null,
          photoURL: session.user.user_metadata?.avatar_url || null,
          supabaseId: session.user.id,
          authSource: 'supabase',
        });

        // If user should be admin, explicitly update their role
        if (isAdminEmail) {
          try {
            const db = await getDB();
            await db
              .update(usersSchema)
              .set({ role: 'admin' })
              .where(eq(usersSchema.email, email));

            console.log(`✅ Admin role set for ${email}`);
          } catch (dbError) {
            console.error('Failed to update admin role:', dbError);
            return NextResponse.json({
              error: 'Failed to update admin role',
              details: dbError instanceof Error ? dbError.message : 'Unknown error',
            }, { status: 500 });
          }
        }

        // Verify the role was set correctly
        const db = await getDB();
        const updatedUser = await db
          .select({ role: usersSchema.role, email: usersSchema.email })
          .from(usersSchema)
          .where(eq(usersSchema.email, email))
          .limit(1);

        return NextResponse.json({
          success: true,
          email,
          isAdminEmail,
          adminEmail,
          syncResult,
          currentRole: updatedUser[0]?.role || 'not found',
          message: isAdminEmail ? 'Admin role has been set' : 'User synced successfully',
        });
      } catch (error) {
        console.error('Sync admin role error:', error);
        return NextResponse.json({
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    });
  });
}
