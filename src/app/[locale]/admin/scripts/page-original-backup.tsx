/**
 * 🛠️ 脚本管理集成页面
 * 集中管理所有系统脚本和工具
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeploymentTools } from './components/DeploymentTools';
import { EnvironmentManager } from './components/EnvironmentManager';
import { ScriptsManagementClient } from './components/ScriptsManagementClient';
import { ShopifyIntegrationManager } from './components/ShopifyIntegrationManager';
import { SystemHealthDashboard } from './components/SystemHealthDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin');

  return {
    title: `${t('scripts.title')} | Thepalmistrylife Admin`,
    description: t('scripts.description'),
  };
}

export default async function ScriptsManagementPage() {
  const t = await getTranslations('admin.scripts');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('description')}
          </p>
        </div>
      </div>

      {/* 系统健康概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏥
            {' '}
            {t('health.title')}
          </CardTitle>
          <CardDescription>
            {t('health.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 rounded"></div>}>
            <SystemHealthDashboard />
          </Suspense>
        </CardContent>
      </Card>

      {/* 主要功能标签页 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="shopify">{t('tabs.shopify')}</TabsTrigger>
          <TabsTrigger value="environment">{t('tabs.environment')}</TabsTrigger>
          <TabsTrigger value="deployment">{t('tabs.deployment')}</TabsTrigger>
          <TabsTrigger value="scripts">{t('tabs.scripts')}</TabsTrigger>
        </TabsList>

        {/* 概览页面 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🔧
                  {t('overview.coreScripts')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  15 个核心脚本可用
                </p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-600">✅ 环境验证</div>
                  <div className="text-xs text-green-600">✅ 构建验证</div>
                  <div className="text-xs text-green-600">✅ Stripe 同步</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🛍️
                  {t('overview.shopifyStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shopify 集成状态
                </p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-600">✅ API 连接</div>
                  <div className="text-xs text-yellow-600">⚠️ 产品同步</div>
                  <div className="text-xs text-green-600">✅ 配置验证</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  📊
                  {t('overview.systemHealth')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  系统整体健康状态
                </p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-green-600">✅ 数据库连接</div>
                  <div className="text-xs text-green-600">✅ Redis 缓存</div>
                  <div className="text-xs text-green-600">✅ API 服务</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shopify 集成管理 */}
        <TabsContent value="shopify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                🛍️
                {t('shopify.title')}
              </CardTitle>
              <CardDescription>
                {t('shopify.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                <ShopifyIntegrationManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 环境管理 */}
        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                ⚙️
                {t('environment.title')}
              </CardTitle>
              <CardDescription>
                {t('environment.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                <EnvironmentManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 部署工具 */}
        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                🚀
                {t('deployment.title')}
              </CardTitle>
              <CardDescription>
                {t('deployment.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                <DeploymentTools />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 脚本管理 */}
        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                📜
                {t('scripts.title')}
              </CardTitle>
              <CardDescription>
                {t('scripts.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                <ScriptsManagementClient />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
