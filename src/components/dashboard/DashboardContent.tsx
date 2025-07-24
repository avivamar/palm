'use client';

import {
  ArrowUpRight,
  Bell,
  CreditCard,
  Gift,
  Heart,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type DashboardStats = {
  orders: {
    total: number;
    completed: number;
    processing: number;
    cancelled: number;
    totalSpent: number;
    currency: string;
  };
  favorites: {
    total: number;
    categories: string[];
  };
  account: {
    joinDate: string;
    lastLogin: string;
    emailVerified: boolean;
    profileCompleted: number;
  };
  notifications: {
    unread: number;
    total: number;
  };
  activity: {
    level: string;
    points: number;
    nextLevelPoints: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    metadata: any;
  }>;
};

// Mock function to fetch dashboard stats
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    orders: {
      total: 12,
      completed: 8,
      processing: 3,
      cancelled: 1,
      totalSpent: 2580,
      currency: 'USD',
    },
    favorites: {
      total: 5,
      categories: ['Electronics', 'Fashion'],
    },
    account: {
      joinDate: '2024-01-15',
      lastLogin: '2024-03-15',
      emailVerified: true,
      profileCompleted: 85,
    },
    notifications: {
      unread: 2,
      total: 15,
    },
    activity: {
      level: 'Gold',
      points: 1250,
      nextLevelPoints: 2000,
    },
    recentActivity: [],
  };
}

export default function DashboardContent() {
  const { user, loading } = useAuth();
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // 获取仪表板统计数据
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  if (loading || statsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="mb-6">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{t('need_login')}</h2>
          <p className="text-muted-foreground mb-6">{t('please_login')}</p>
        </div>
        <Link href="/sign-in">
          <Button size="lg">{t('sign_in_now')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero欢迎区域 - 现代化渐变设计 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-violet-200/20 dark:border-violet-800/20">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="bg-violet-100/50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                Welcome Back
              </Badge>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hello,
              {' '}
              {user.displayName || user.email?.split('@')[0] || 'User'}
              !
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              {t('welcome_message')}
            </p>
            {stats && (
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                  {t('quick_stats.activity_points_desc', { points: stats.activity.points })}
                </Badge>
                <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                  {t('quick_stats.orders_completed', { count: stats.orders.completed })}
                </Badge>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-purple-500/25">
                {((user?.displayName || user?.email || 'U')[0] || 'U').toUpperCase()}
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 - 混合网格布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatsCard
          title={t('quick_stats.account_status')}
          value={`${stats?.account.profileCompleted || 0}%`}
          description={t('quick_stats.profile_completion', { percentage: stats?.account.profileCompleted || 0 })}
          icon={<User className="h-5 w-5" />}
          gradient="from-blue-500 to-cyan-600"
        />
        <ModernStatsCard
          title={t('stats.total_orders')}
          value={stats?.orders.total || 0}
          description={t('quick_stats.orders_completed', { count: stats?.orders.completed || 0 })}
          icon={<ShoppingBag className="h-5 w-5" />}
          gradient="from-green-500 to-emerald-600"
        />
        <ModernStatsCard
          title={t('stats.total_spent')}
          value={`$${stats?.orders.totalSpent || 0}`}
          description={t('quick_stats.activity_points_desc', { points: stats?.activity.points || 0 })}
          icon={<TrendingUp className="h-5 w-5" />}
          gradient="from-purple-500 to-violet-600"
        />
        <ModernStatsCard
          title={t('stats.loyalty_points')}
          value={stats?.activity.points || 0}
          description={t('quick_stats.total_notifications', { total: stats?.notifications.total || 0 })}
          icon={<Star className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Bento网格布局 - 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[120px]">
        {/* 个人资料 - 占据2x2 */}
        <Card className="md:col-span-3 lg:col-span-4 row-span-2 group hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <User className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-bold mb-2">{t('quick_actions.personal_profile')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('quick_actions.personal_profile_desc')}</p>
            <Link href="/dashboard/user-profile">
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                {t('quick_actions.manage_profile')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 浏览产品 - 占据1x2 */}
        <Card className="md:col-span-3 lg:col-span-2 row-span-2 group hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-600 transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-bold mb-2">{t('quick_actions.browse_products')}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t('quick_actions.browse_products_desc')}</p>
            <Link href="/pre-order">
              <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                {t('quick_actions.view_products')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 收藏夹 - 占据1x1 */}
        <Card className="md:col-span-2 lg:col-span-2 group hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('quick_actions.favorites')}</h3>
              <p className="text-xs text-muted-foreground">
                0
                {' '}
                {t('quick_actions.favorites_desc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 设置 - 占据1x1 */}
        <Card className="md:col-span-2 lg:col-span-2 group hover:shadow-xl hover:shadow-slate-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/20 dark:to-gray-950/20">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-slate-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{t('quick_actions.account_settings')}</h3>
              <p className="text-xs text-muted-foreground">{t('quick_actions.account_settings_desc')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 账户信息 */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg text-white">
                <User className="h-5 w-5" />
              </div>
              {t('account_info.title')}
            </CardTitle>
            <CardDescription>{t('account_info.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoRow
                label="Email"
                value={user.email || 'Not provided'}
                verified={stats?.account.emailVerified}
                t={t}
              />
              <InfoRow
                label="Phone"
                value="Not provided"
                verified={false}
                t={t}
              />
              <InfoRow
                label="Profile"
                value={`${stats?.account.profileCompleted || 0}% complete`}
                verified={true}
                t={t}
              />
              <InfoRow
                label="Level"
                value={stats?.activity.level || 'Bronze'}
                verified={true}
                t={t}
              />
            </div>
          </CardContent>
        </Card>

        {/* 快速链接 - 现代化设计 */}
        <Card className="border-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              {t('quick_links.title')}
            </CardTitle>
            <CardDescription>{t('quick_links.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ModernQuickLink
                href="/dashboard/orders"
                icon={<ShoppingBag className="h-5 w-5" />}
                label={t('quick_links.my_orders')}
                gradient="from-blue-500 to-cyan-500"
              />
              <ModernQuickLink
                href="/dashboard/favorites"
                icon={<Heart className="h-5 w-5" />}
                label={t('quick_links.favorites')}
                gradient="from-pink-500 to-rose-500"
              />
              <ModernQuickLink
                href="/dashboard/billing"
                icon={<CreditCard className="h-5 w-5" />}
                label={t('quick_links.billing_management')}
                gradient="from-emerald-500 to-teal-500"
              />
              <ModernQuickLink
                href="/contact"
                icon={<Bell className="h-5 w-5" />}
                label={t('quick_links.customer_support')}
                gradient="from-amber-500 to-orange-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 现代化统计卡片组件
function ModernStatsCard({
  title,
  value,
  icon,
  description,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="border-0 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 信息行组件
function InfoRow({
  label,
  value,
  verified,
  t,
}: {
  label: string;
  value: string;
  verified?: boolean;
  t: any;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{value}</span>
        {verified !== undefined && (
          <Badge
            variant={verified ? 'default' : 'secondary'}
            className={`text-xs ${
              verified
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {verified ? t('quick_stats.verified') : t('quick_stats.unverified')}
          </Badge>
        )}
      </div>
    </div>
  );
}

// 现代化快速链接组件
function ModernQuickLink({
  href,
  icon,
  label,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white/60 dark:bg-gray-800/40 hover:bg-white/80 dark:hover:bg-gray-800/60 transition-all duration-300 cursor-pointer border border-gray-100/50 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-center group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{label}</span>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero区域骨架 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-violet-200/20 dark:border-violet-800/20">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl animate-pulse"></div>
              <div className="w-24 h-6 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="h-10 w-80 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-96 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="hidden md:block w-24 h-24 bg-muted rounded-2xl animate-pulse"></div>
        </div>
      </div>

      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={`stats-skeleton-${index}`} className="border-0 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-16 bg-muted rounded-2xl animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bento网格骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[120px]">
        <div className="md:col-span-3 lg:col-span-4 row-span-2 bg-muted rounded-2xl animate-pulse"></div>
        <div className="md:col-span-3 lg:col-span-2 row-span-2 bg-muted rounded-2xl animate-pulse"></div>
        <div className="md:col-span-2 lg:col-span-2 bg-muted rounded-2xl animate-pulse"></div>
        <div className="md:col-span-2 lg:col-span-2 bg-muted rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}
