/**
 * Admin Layout - Updated to use Admin Package
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { Metadata } from 'next';
import { BarChart3, Home, Monitor, Settings, ShoppingCart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getUserRole, getUserRoleByEmail } from '@/app/actions/userActions';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

// Force dynamic rendering for admin routes that use auth
export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: t('header.title'),
    description: t('header.description'),
  };
}

async function verifyAdminAccess(): Promise<boolean> {
  try {
    console.log('🔍 Admin layout: Starting admin access verification...');

    // 检查 Supabase 配置
    if (!isSupabaseConfigured) {
      console.warn('❌ Admin layout: Supabase not configured, skipping admin access verification');
      return false;
    }

    // 使用 Supabase 验证用户会话
    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('❌ Admin layout: No valid session', error);
      return false;
    }

    const userId = session.user.id;
    const email = session.user.email;
    console.log(`🔍 Admin layout: Checking access for user ${email} (ID: ${userId})`);

    // 首先尝试根据用户ID检查角色
    let roleResult = await getUserRole(userId);
    console.log(`🔍 Admin layout: getUserRole(${userId}) result:`, roleResult);

    // 如果根据用户ID找不到，尝试根据邮箱查找
    if (!roleResult.success && email) {
      console.warn(`⚠️ Admin layout: Fallback to email lookup for user: ${email}`);
      roleResult = await getUserRoleByEmail(email);
      console.log(`🔍 Admin layout: getUserRoleByEmail(${email}) result:`, roleResult);
    }

    const isAdmin = roleResult.success && roleResult.role === 'admin';
    const message = `Admin access check for ${email}: ${isAdmin ? 'GRANTED ✅' : 'DENIED ❌'}`;
    console.log(`🎯 Admin layout: ${message}`);

    if (!isAdmin && roleResult.success) {
      console.log(`🔍 Admin layout: User role is '${roleResult.role}', expected 'admin'`);
    }

    return isAdmin;
  } catch (error) {
    console.error('❌ Admin layout: Access verification failed:', error);
    return false;
  }
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('admin');

  // Check admin access but don't redirect - let individual pages handle it
  const isAdmin = await verifyAdminAccess();

  return (
    <div className="min-h-screen bg-background">
      {!isAdmin && (
        <div className="bg-orange-500 text-white p-2 text-center text-sm">
          Limited access mode - Some features may be restricted
        </div>
      )}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r">
          <div className="flex flex-col h-full">
            <div className="p-6">
              <h2 className="text-xl font-bold">{t('navigation.title')}</h2>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              <Link
                href={`/${locale}/admin`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                <span>{t('navigation.dashboard')}</span>
              </Link>

              <Link
                href={`/${locale}/admin/users`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <Users className="h-4 w-4" />
                <span>{t('navigation.users')}</span>
              </Link>

              <Link
                href={`/${locale}/admin/shopify`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{t('navigation.shopify')}</span>
              </Link>

              <Link
                href={`/${locale}/admin/monitoring`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <Monitor className="h-4 w-4" />
                <span>{t('navigation.monitoring')}</span>
              </Link>

              <Link
                href={`/${locale}/admin/scripts`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                <span>{t('navigation.scripts')}</span>
              </Link>

              <Link
                href={`/${locale}/admin/performance`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Performance</span>
              </Link>
            </nav>

            <div className="p-4 border-t">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-accent text-sm"
              >
                <span>← Back to Main Site</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b px-6 py-4">
            <h1 className="text-2xl font-bold">{t('header.title')}</h1>
            <p className="text-muted-foreground">{t('header.description')}</p>
          </header>

          <main className="flex-1 overflow-auto p-6" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
