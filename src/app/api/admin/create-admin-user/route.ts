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

        if (email !== adminEmail) {
          return NextResponse.json({
            error: 'Not authorized',
            message: `Your email (${email}) does not match ADMIN_EMAIL (${adminEmail})`,
          }, { status: 403 });
        }

        try {
          const db = await getDB();

          // Check if user already exists
          const existingUser = await db
            .select()
            .from(usersSchema)
            .where(eq(usersSchema.email, email))
            .limit(1);

          if (existingUser.length > 0) {
            // Update existing user to admin
            await db
              .update(usersSchema)
              .set({
                role: 'admin',
                supabaseId: session.user.id,
                authSource: 'supabase',
                displayName: session.user.user_metadata?.name || null,
                photoURL: session.user.user_metadata?.avatar_url || null,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(usersSchema.email, email));

            return NextResponse.json({
              success: true,
              message: 'Existing user updated to admin role',
              user: { email, role: 'admin', id: existingUser[0].id },
            });
          } else {
            // Create new admin user
            const [newUser] = await db
              .insert(usersSchema)
              .values({
                id: session.user.id,
                email,
                displayName: session.user.user_metadata?.name || null,
                photoURL: session.user.user_metadata?.avatar_url || null,
                role: 'admin',
                supabaseId: session.user.id,
                authSource: 'supabase',
                emailVerified: true,
                marketingConsent: false,
                referralCount: 0,
                lastLoginAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning({ id: usersSchema.id, email: usersSchema.email, role: usersSchema.role });

            return NextResponse.json({
              success: true,
              message: 'New admin user created successfully',
              user: newUser,
            });
          }
        } catch (dbError) {
          console.error('Database error:', dbError);

          // If table doesn't exist, provide helpful error
          if (dbError instanceof Error && dbError.message.includes('does not exist')) {
            return NextResponse.json({
              error: 'Database not properly initialized',
              details: 'The users table does not exist. Please run database migrations.',
              suggestion: 'Run: npm run db:migrate',
              dbError: dbError.message,
            }, { status: 500 });
          }

          return NextResponse.json({
            error: 'Database operation failed',
            details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          }, { status: 500 });
        }
      } catch (error) {
        console.error('Create admin user error:', error);
        return NextResponse.json({
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    });
  });
}
