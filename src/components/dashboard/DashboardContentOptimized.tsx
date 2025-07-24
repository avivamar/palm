'use client';

import {
  ArrowUpRight,
  Gift,
  Heart,
  Settings,
  Share2,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// 懒加载组件
const RecentActivityCard = lazy(() => import('./RecentActivityCard'));
const AccountInfoCard = lazy(() => import('./AccountInfoCard'));
const QuickLinksCard = lazy(() => import('./QuickLinksCard'));
const ReferralDashboard = lazy(() => import('./ReferralDashboard'));

// 类型定义
type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

export type DashboardContentOptimizedProps = {
  user?: AuthUser;
};

// 数据获取函数
async function fetchDashboardStats(userId: string) {
  try {
    const response = await fetch(`/api/dashboard/stats?userId=${userId}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export default function DashboardContentOptimized({ user: propUser }: DashboardContentOptimizedProps) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const t = useTranslations('dashboard');

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await fetchDashboardStats(user.id);
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  // 如果没有用户信息，显示加载状态
  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Hero 部分 - 立即渲染 */}
      <HeroSection user={user} stats={stats} t={t} />

      {/* 快速操作网格 - 立即渲染 */}
      <QuickActionsGrid t={t} />

      {/* 统计卡片 - 延迟加载 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <StatsCard
            title={t('stats.total_orders')}
            value={statsLoading
              ? '...'
              : stats?.orders?.total || 0}
            description={statsLoading
              ? '...'
              : t('stats.orders_description')}
            gradient="from-blue-500 to-cyan-600"
          />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <StatsCard
            title={t('stats.active_subscriptions')}
            value={statsLoading
              ? '...'
              : stats?.subscriptions?.active || 0}
            description={statsLoading
              ? '...'
              : t('stats.subscriptions_description')}
            gradient="from-green-500 to-emerald-600"
          />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <StatsCard
            title={t('stats.total_spent')}
            value={statsLoading
              ? '...'
              : `$${stats?.spending?.total || 0}`}
            description={statsLoading
              ? '...'
              : t('stats.spending_description')}
            gradient="from-purple-500 to-pink-600"
          />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <StatsCard
            title={t('stats.loyalty_points')}
            value={statsLoading
              ? '...'
              : stats?.loyalty?.points || 0}
            description={statsLoading
              ? '...'
              : t('stats.loyalty_description')}
            gradient="from-amber-500 to-orange-600"
          />
        </Suspense>
      </div>

      {/* 推荐系统面板 */}
      <Suspense fallback={<CardSkeleton />}>
        <ReferralDashboard />
      </Suspense>

      {/* 最近活动和账户信息 - 延迟加载 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          {!statsLoading && stats && (
            <RecentActivityCard
              activities={stats.recentActivity}
              t={t}
            />
          )}
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          {user && (
            <AccountInfoCard
              user={user}
              t={t}
            />
          )}
        </Suspense>
      </div>

      {/* 快速链接 - 延迟加载 */}
      <Suspense fallback={<CardSkeleton />}>
        <QuickLinksCard t={t} />
      </Suspense>
    </div>
  );
}

// Hero 部分单独抽离，立即渲染
function HeroSection({ user, stats, t }: any) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-violet-200/20 dark:border-violet-800/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-xl"></div>

      <div className="relative flex items-center justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <Badge variant="secondary" className="bg-violet-100/50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {t('welcome_back')}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('hello_greeting')}
            ,
            {' '}
            <span className="text-2xl font-bold text-gray-900">
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            !
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {t('welcome_message')}
          </p>
          {stats && (
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                {t('quick_stats.activity_points_desc', { points: stats.activity?.points || 0 })}
              </Badge>
              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                {t('quick_stats.orders_completed', { count: stats.orders?.completed || 0 })}
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
  );
}

// 快速操作网格 - 静态内容
function QuickActionsGrid({ t }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[120px]">
      {/* 个人资料 - 占据2x2 */}
      <Card className="md:col-span-3 lg:col-span-3 row-span-2 group hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
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

      {/* 推荐朋友 - 占据1x2 */}
      <Card className="md:col-span-3 lg:col-span-3 row-span-2 group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
              <Share2 className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-bold mb-2">Invite Friends</h3>
          <p className="text-xs text-muted-foreground mb-4">Share your referral link and earn rewards for each successful referral</p>
          <Badge variant="secondary" className="bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Earn rewards now
          </Badge>
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
            <h3 className="font-bold text-sm">{t('favorites.title')}</h3>
            <p className="text-xs text-muted-foreground">
              0 個商品
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
  );
}

// 骨架屏组件
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero区域骨架 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-violet-200/20 dark:border-violet-800/20">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl"></div>
              <div className="w-24 h-6 bg-muted rounded-full"></div>
            </div>
            <div className="h-10 w-80 bg-muted rounded"></div>
            <div className="h-6 w-96 bg-muted rounded"></div>
          </div>
          <div className="hidden md:block w-24 h-24 bg-muted rounded-2xl"></div>
        </div>
      </div>

      {/* 快速操作网格骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-[120px]">
        <div className="md:col-span-3 lg:col-span-4 row-span-2 bg-muted rounded-xl"></div>
        <div className="md:col-span-3 lg:col-span-2 row-span-2 bg-muted rounded-xl"></div>
        <div className="md:col-span-2 lg:col-span-2 bg-muted rounded-xl"></div>
        <div className="md:col-span-2 lg:col-span-2 bg-muted rounded-xl"></div>
      </div>

      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl"></div>
        ))}
      </div>

      {/* 底部卡片骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="h-32 bg-muted rounded-xl animate-pulse"></div>
  );
}

function StatsCard({ title, value, description, gradient }: {
  title: string;
  value: string | number;
  description: string;
  gradient: string;
}) {
  return (
    <Card className="border-0 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg text-white`}>
            <div className="w-5 h-5"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
