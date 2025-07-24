/**
 * Scripts Feature Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type {
  CoreScriptsData,
  ScriptsTranslations,
  ShopifyStatus,
  SystemHealthData,
} from './types';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAdminStore } from '../../stores/admin-store';
import { DeploymentTools } from './components/DeploymentTools';
import { EnvironmentManager } from './components/EnvironmentManager';
import { ScriptsExecutor } from './components/ScriptsExecutor';

type ScriptsProps = {
  locale: string;
  translations: ScriptsTranslations;
  systemHealth: SystemHealthData;
  shopifyStatus: ShopifyStatus;
  coreScripts: CoreScriptsData;
};

function getStatusIcon(status: 'healthy' | 'warning' | 'critical') {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '❌';
    default:
      return '❓';
  }
}

function getStatusText(status: 'healthy' | 'warning' | 'critical', label: string) {
  const icon = getStatusIcon(status);
  return `${icon} ${label}`;
}

function SystemHealthOverview({
  systemHealth,
  shopifyStatus,
  coreScripts,
  translations,
}: {
  systemHealth: SystemHealthData;
  shopifyStatus: ShopifyStatus;
  coreScripts: CoreScriptsData;
  translations: ScriptsTranslations;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            🔧
            {translations.overview.coreScripts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {translations.overview.coreScriptsCount}
          </p>
          <div className="mt-2 space-y-1">
            <div className="text-xs">{getStatusText(coreScripts.environmentValidation, translations.statusLabels.environmentValidation)}</div>
            <div className="text-xs">{getStatusText(coreScripts.buildValidation, translations.statusLabels.buildValidation)}</div>
            <div className="text-xs">{getStatusText(coreScripts.stripeSync, translations.statusLabels.stripeSync)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            🛍️
            {translations.overview.shopifyStatus}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {translations.overview.shopifyIntegrationStatus}
          </p>
          <div className="mt-2 space-y-1">
            <div className="text-xs">{getStatusText(shopifyStatus.apiConnection, translations.statusLabels.apiConnection)}</div>
            <div className="text-xs">{getStatusText(shopifyStatus.productSync, translations.statusLabels.productSync)}</div>
            <div className="text-xs">{getStatusText(shopifyStatus.configValidation, translations.statusLabels.configValidation)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            📊
            {translations.overview.systemHealth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {translations.overview.systemOverallHealth}
          </p>
          <div className="mt-2 space-y-1">
            <div className="text-xs">{getStatusText(systemHealth.database, translations.statusLabels.databaseConnection)}</div>
            <div className="text-xs">{getStatusText(systemHealth.redis, translations.statusLabels.redisCache)}</div>
            <div className="text-xs">{getStatusText(systemHealth.api, translations.statusLabels.apiService)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Scripts({
  translations,
  systemHealth,
  shopifyStatus,
  coreScripts,
}: ScriptsProps) {
  const { actions } = useAdminStore();

  useEffect(() => {
    // Load scripts module on mount
    actions.loadModule('scripts');
  }, [actions]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {translations.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {translations.description}
          </p>
        </div>
      </div>

      {/* 系统健康概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏥
            {' '}
            {translations.health.title}
          </CardTitle>
          <CardDescription>
            {translations.health.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded flex items-center justify-center">
            <span className="text-muted-foreground">System Health Dashboard</span>
          </div>
        </CardContent>
      </Card>

      {/* 主要功能标签页 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{translations.tabs.overview}</TabsTrigger>
          <TabsTrigger value="shopify">{translations.tabs.shopify}</TabsTrigger>
          <TabsTrigger value="environment">{translations.tabs.environment}</TabsTrigger>
          <TabsTrigger value="deployment">{translations.tabs.deployment}</TabsTrigger>
          <TabsTrigger value="scripts">{translations.tabs.scripts}</TabsTrigger>
        </TabsList>

        {/* 概览页面 */}
        <TabsContent value="overview" className="space-y-4">
          <SystemHealthOverview
            systemHealth={systemHealth}
            shopifyStatus={shopifyStatus}
            coreScripts={coreScripts}
            translations={translations}
          />
        </TabsContent>

        {/* Shopify 集成管理 */}
        <TabsContent value="shopify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                🛍️
                {translations.shopify.title}
              </CardTitle>
              <CardDescription>
                {translations.shopify.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold mb-2">Shopify Integration Manager</h3>
                <p className="text-muted-foreground max-w-md">
                  {translations.shopify.managementDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 环境管理 */}
        <TabsContent value="environment" className="space-y-4">
          <EnvironmentManager />
        </TabsContent>

        {/* 部署工具 */}
        <TabsContent value="deployment" className="space-y-4">
          <DeploymentTools />
        </TabsContent>

        {/* 脚本管理 */}
        <TabsContent value="scripts" className="space-y-4">
          <ScriptsExecutor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
