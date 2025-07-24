/**
 * Admin Referral Management Page
 * Integrated referral system configuration and statistics
 */

// Dynamic imports for referral components
import NextDynamic from 'next/dynamic';
import { Suspense } from 'react';
import { getUserRole, getUserRoleByEmail } from '@/app/actions/userActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from '@/libs/i18nNavigation';

import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

const ReferralConfig = NextDynamic(() => import('./components/ReferralConfig'), {
  loading: () => <Card><CardContent className="p-6">Loading configuration...</CardContent></Card>,
});

const ReferralStats = NextDynamic(() => import('./components/ReferralStats'), {
  loading: () => <Card><CardContent className="p-6">Loading statistics...</CardContent></Card>,
});

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

async function checkAdminAccess() {
  try {
    if (!isSupabaseConfigured) {
      return false;
    }

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return false;
    }

    let roleResult = await getUserRole(session.user.id);
    if (!roleResult.success && session.user.email) {
      roleResult = await getUserRoleByEmail(session.user.email);
    }

    const isAdmin = roleResult.success && roleResult.role === 'admin';
    
    // 记录访问日志用于安全审计
    if (isAdmin) {
      console.log(`[Admin Access] Admin access granted for user: ${session.user.email} (ID: ${session.user.id})`);
    } else {
      console.warn(`[Admin Access] Admin access denied for user: ${session.user.email} (ID: ${session.user.id}), role: ${roleResult.role || 'unknown'}`);
    }

    return isAdmin;
  } catch (error) {
    console.error('[Admin Access] Error checking admin access:', error);
    return false;
  }
}

export default async function ReferralManagementPage({ params }: Props) {
  const { locale } = await params;

  // Check admin access
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    redirect({ href: '/unauthorized', locale });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral System Management</h1>
        <p className="text-muted-foreground">
          Configure and monitor the referral system performance
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-400">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Suspense fallback={(
            <Card>
              <CardHeader>
                <CardTitle>Referral Configuration</CardTitle>
                <CardDescription>Loading configuration panel...</CardDescription>
              </CardHeader>
            </Card>
          )}
          >
            <ReferralConfig />
          </Suspense>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Suspense fallback={(
            <Card>
              <CardHeader>
                <CardTitle>Referral Statistics</CardTitle>
                <CardDescription>Loading statistics dashboard...</CardDescription>
              </CardHeader>
            </Card>
          )}
          >
            <ReferralStats />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common referral management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">System Status</h4>
              <p className="text-sm text-muted-foreground">
                The referral system is currently integrated and ready for configuration.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Testing</h4>
              <p className="text-sm text-muted-foreground">
                Use the configuration panel to enable the system and test referral links.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Monitoring</h4>
              <p className="text-sm text-muted-foreground">
                Track referral performance in the statistics dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
