/**
 * Admin Shopify Management Page
 * Shopify 管理主页面 - 集成概览、订单同步、库存管理等功能
 */

import { getTranslations } from 'next-intl/server';
import React from 'react';
import { AdminLayoutClient } from '../../../../components/admin/AdminLayoutClientSimple';
import { HealthMonitor } from './components/HealthMonitor';
import { InventoryManager } from './components/InventoryManager';
import { OrderSyncPanel } from './components/OrderSyncPanel';
import { ShopifyOverview } from './components/ShopifyOverview';
import { SyncLogs } from './components/SyncLogs';

// Force dynamic rendering for admin dashboard
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ShopifyAdminPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  // Build proper translations object from admin.json
  const translations = {
    header: {
      title: t('shopify.title'),
      breadcrumbs: {
        admin: t('navigation.title'),
        shopify: t('navigation.shopify'),
      },
      user: {
        profile: t('header.userMenu.profile'),
        settings: t('header.userMenu.settings'),
        logout: t('header.userMenu.signOut'),
      },
    },
    navigation: {
      dashboard: t('navigation.dashboard'),
      users: t('navigation.users'),
      analytics: t('navigation.analytics'),
      shopify: t('navigation.shopify'),
      monitoring: t('navigation.monitoring'),
      performance: t('navigation.performance'),
      scripts: t('navigation.scripts'),
      logout: t('header.userMenu.signOut'),
    },
    shopify: {
      overview: t('shopify.overview'),
      orderSync: t('shopify.orderSync'),
      inventory: t('shopify.inventory'),
      syncLogs: t('shopify.syncLogs'),
      health: t('shopify.health'),
      description: t('shopify.description'),
    },
  };

  return (
    <AdminLayoutClient locale={locale}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {translations.header.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {translations.shopify.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                Configure Settings
              </button>
              <button className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                Sync Now
              </button>
            </div>
          </div>
        </div>

        {/* Health Monitor - Always visible at top */}
        <HealthMonitor />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Overview */}
          <div className="xl:col-span-2 space-y-6">
            <ShopifyOverview />
            <OrderSyncPanel />
          </div>

          {/* Right Column - Inventory & Logs */}
          <div className="space-y-6">
            <InventoryManager />
            <SyncLogs />
          </div>
        </div>
      </div>
    </AdminLayoutClient>
  );
}
