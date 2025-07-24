/**
 * Admin Scripts Page - Updated to use Admin Package
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { CoreScriptsData, ShopifyStatus, SystemHealthData } from '@rolitt/admin';
import { Scripts } from '@rolitt/admin';
import { getTranslations } from 'next-intl/server';
import { fetchCoreScriptsStatus, fetchShopifyStatus, fetchSystemHealth } from '@/libs/admin/health-api';

// Force dynamic rendering for admin scripts page
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ScriptsPage({ params }: Props) {
  const { locale } = await params;

  // Fetch translations and real health data
  const [t, systemHealthResponse, shopifyStatusResponse, coreScriptsResponse] = await Promise.all([
    getTranslations('admin'),
    fetchSystemHealth().catch((error) => {
      console.error('Failed to fetch system health:', error);
      return {
        database: 'critical' as const,
        redis: 'critical' as const,
        api: 'critical' as const,
        details: {
          database: 'API Error',
          redis: 'API Error',
          api: 'API Error',
        },
      };
    }),
    fetchShopifyStatus().catch((error) => {
      console.error('Failed to fetch Shopify status:', error);
      return {
        apiConnection: 'critical' as const,
        productSync: 'critical' as const,
        configValidation: 'critical' as const,
        details: {
          apiConnection: 'API Error',
          productSync: 'API Error',
          configValidation: 'API Error',
        },
      };
    }),
    fetchCoreScriptsStatus().catch((error) => {
      console.error('Failed to fetch core scripts status:', error);
      return {
        environmentValidation: 'critical' as const,
        buildValidation: 'critical' as const,
        stripeSync: 'critical' as const,
        details: {
          environmentValidation: 'API Error',
          buildValidation: 'API Error',
          stripeSync: 'API Error',
        },
      };
    }),
  ]);

  // Transform API responses to match component interface
  const systemHealth: SystemHealthData = {
    database: systemHealthResponse.database,
    redis: systemHealthResponse.redis,
    api: systemHealthResponse.api,
  };

  const shopifyStatus: ShopifyStatus = {
    apiConnection: shopifyStatusResponse.apiConnection,
    productSync: shopifyStatusResponse.productSync,
    configValidation: shopifyStatusResponse.configValidation,
  };

  const coreScripts: CoreScriptsData = {
    environmentValidation: coreScriptsResponse.environmentValidation,
    buildValidation: coreScriptsResponse.buildValidation,
    stripeSync: coreScriptsResponse.stripeSync,
  };

  // Build translations object for the scripts component
  const translations = {
    title: t('scripts.title'),
    description: t('scripts.description'),
    health: {
      title: t('scripts.health.title'),
      description: t('scripts.health.description'),
    },
    tabs: {
      overview: t('scripts.tabs.overview'),
      shopify: t('scripts.tabs.shopify'),
      environment: t('scripts.tabs.environment'),
      deployment: t('scripts.tabs.deployment'),
      scripts: t('scripts.tabs.scripts'),
    },
    overview: {
      coreScripts: t('scripts.overview.coreScripts'),
      shopifyStatus: t('scripts.overview.shopifyStatus'),
      systemHealth: t('scripts.overview.systemHealth'),
      coreScriptsCount: t('scripts.overview.coreScriptsCount'),
      shopifyIntegrationStatus: t('scripts.overview.shopifyIntegrationStatus'),
      systemOverallHealth: t('scripts.overview.systemOverallHealth'),
    },
    statusLabels: {
      environmentValidation: t('scripts.statusLabels.environmentValidation'),
      buildValidation: t('scripts.statusLabels.buildValidation'),
      stripeSync: t('scripts.statusLabels.stripeSync'),
      apiConnection: t('scripts.statusLabels.apiConnection'),
      productSync: t('scripts.statusLabels.productSync'),
      configValidation: t('scripts.statusLabels.configValidation'),
      databaseConnection: t('scripts.statusLabels.databaseConnection'),
      redisCache: t('scripts.statusLabels.redisCache'),
      apiService: t('scripts.statusLabels.apiService'),
    },
    shopify: {
      title: t('scripts.shopify.title'),
      description: t('scripts.shopify.description'),
      managementDescription: t('scripts.shopify.managementDescription'),
    },
    environment: {
      title: t('scripts.environment.title'),
      description: t('scripts.environment.description'),
    },
    deployment: {
      title: t('scripts.deployment.title'),
      description: t('scripts.deployment.description'),
    },
    scripts: {
      title: t('scripts.scripts.title'),
      description: t('scripts.scripts.description'),
    },
  };

  return (
    <Scripts
      locale={locale}
      translations={translations}
      systemHealth={systemHealth}
      shopifyStatus={shopifyStatus}
      coreScripts={coreScripts}
    />
  );
}
