/**
 * Admin Dashboard Page - Simplified Implementation
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import { BarChart3, Monitor, Settings, Share2, ShoppingCart, Users, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getUserRole, getUserRoleByEmail } from '@/app/actions/userActions';
import { redirect } from '@/libs/i18nNavigation';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

// Force dynamic rendering for admin dashboard
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

    // Check role by ID first, then by email
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

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;

  // Check admin access
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    redirect({ href: '/unauthorized', locale });
  }

  const t = await getTranslations('admin');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{t('dashboard.quickStats.totalUsers')}</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{t('dashboard.quickStats.totalOrders')}</h3>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">456</div>
          <p className="text-xs text-muted-foreground">+12.5% from last month</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{t('dashboard.quickStats.revenue')}</h3>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">$12,345</div>
          <p className="text-xs text-muted-foreground">+8.2% from last month</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">{t('dashboard.quickStats.conversionRate')}</h3>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">3.24%</div>
          <p className="text-xs text-muted-foreground">+0.1% from last month</p>
        </div>
      </div>

      {/* Navigation Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${locale}/admin/monitoring`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Monitor className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('dashboard.modules.monitoring.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.modules.monitoring.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/users`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('dashboard.modules.users.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.modules.users.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/shopify`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('navigation.shopify')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('shopify.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/scripts`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('navigation.scripts')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('scripts.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/performance`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('dashboard.modules.performance.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.modules.performance.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/analytics`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('dashboard.modules.analytics.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.modules.analytics.description')}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/referral`}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:bg-accent transition-colors"
        >
          <div className="flex items-center space-x-4">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Referral System</h3>
              <p className="text-sm text-muted-foreground">
                Manage referral configurations and view performance statistics
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
