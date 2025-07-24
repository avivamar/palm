import { eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { usersSchema } from '@/models/Schema';

export async function GET() {
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

    // Get database connection
    const db = await getDB();

    // Get ALL users from database to see what we have
    const allUsers = await db
      .select({
        id: usersSchema.id,
        email: usersSchema.email,
        role: usersSchema.role,
        supabaseId: usersSchema.supabaseId,
        firebaseUid: usersSchema.firebaseUid,
        authSource: usersSchema.authSource,
      })
      .from(usersSchema);

    // Try different matching strategies
    const matchingStrategies = {
      bySupabaseId: await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.supabaseId, currentUser.id)),

      byId: await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.id, currentUser.id)),

      byEmail: await db
        .select()
        .from(usersSchema)
        .where(eq(usersSchema.email, currentUser.email || '')),

      byIdOrSupabaseId: await db
        .select()
        .from(usersSchema)
        .where(or(
          eq(usersSchema.id, currentUser.id),
          eq(usersSchema.supabaseId, currentUser.id),
        )),
    };

    return NextResponse.json({
      success: true,
      currentUser,
      allUsers,
      matchingStrategies,
      analysis: {
        totalUsersInDb: allUsers.length,
        adminUsers: allUsers.filter((u: any) => u.role === 'admin'),
        matchBySupabaseId: matchingStrategies.bySupabaseId.length,
        matchById: matchingStrategies.byId.length,
        matchByEmail: matchingStrategies.byEmail.length,
        matchByIdOrSupabaseId: matchingStrategies.byIdOrSupabaseId.length,
      },
    });
  } catch (error) {
    console.error('Debug user match error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
