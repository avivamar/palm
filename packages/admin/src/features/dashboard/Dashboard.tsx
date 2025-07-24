/**
 * Dashboard Feature Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { DashboardModule, QuickStatProps } from '../../types';
import { Activity, AlertCircle, BarChart3, CheckCircle, DollarSign, Package, ShoppingCart, Store, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModuleCard } from '../../components/ModuleCard';
import { QuickStat } from '../../components/QuickStat';
import { useAdminStore } from '../../stores/admin-store';

// Temporary local Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

type DashboardProps = {
  locale: string;
  translations: {
    title: string;
    description: string;
    quickStats: {
      title: string;
      totalUsers: string;
      totalOrders: string;
      revenue: string;
      conversionRate: string;
    };
    modules: {
      monitoring: {
        title: string;
        description: string;
        viewDashboard: string;
      };
      performance: {
        title: string;
        description: string;
        viewMetrics: string;
      };
      users: {
        title: string;
        description: string;
        comingSoon: string;
      };
      orders: {
        title: string;
        description: string;
        comingSoon: string;
      };
      analytics: {
        title: string;
        description: string;
        comingSoon: string;
      };
    };
  };
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard({ locale, translations }: DashboardProps) {
  const { dashboard, actions } = useAdminStore();
  const [stats, setStats] = useState<QuickStatProps[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!dashboard.loaded && !dashboard.loading) {
      actions.loadDashboardStats();
    }
    // Also load Shopify data
    actions.loadShopifyData();
  }, [dashboard.loaded, dashboard.loading, actions]);

  const handleRefreshShopify = async () => {
    setIsRefreshing(true);
    await actions.loadShopifyData();
    setIsRefreshing(false);
  };

  const handleSyncShopify = async () => {
    setIsRefreshing(true);
    await actions.syncShopifyData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Update stats when dashboard stats change
    if (dashboard.stats) {
      setStats([
        {
          title: translations.quickStats.totalUsers,
          value: dashboard.stats.totalUsers.toLocaleString(),
          change: `${dashboard.stats.totalUsersChange} from last month`,
          icon: Users,
          trend: dashboard.stats.totalUsersChange.startsWith('+') ? 'up' : 'down',
        },
        {
          title: translations.quickStats.totalOrders,
          value: dashboard.stats.totalOrders.toLocaleString(),
          change: `${dashboard.stats.totalOrdersChange} from last month`,
          icon: ShoppingCart,
          trend: dashboard.stats.totalOrdersChange.startsWith('+') ? 'up' : 'down',
        },
        {
          title: translations.quickStats.revenue,
          value: `$${dashboard.stats.revenue.toLocaleString()}`,
          change: `${dashboard.stats.revenueChange} from last month`,
          icon: DollarSign,
          trend: dashboard.stats.revenueChange.startsWith('+') ? 'up' : 'down',
        },
        {
          title: translations.quickStats.conversionRate,
          value: `${dashboard.stats.conversionRate.toFixed(1)}%`,
          change: `${dashboard.stats.conversionRateChange} from last month`,
          icon: TrendingUp,
          trend: dashboard.stats.conversionRateChange.startsWith('+') ? 'up' : 'down',
        },
      ]);
    } else if (!dashboard.loading && !dashboard.loaded) {
      // Show error state when not loading but not loaded
      setStats([
        {
          title: translations.quickStats.totalUsers,
          value: '0',
          change: 'Error loading data',
          icon: Users,
          trend: 'up',
        },
        {
          title: translations.quickStats.totalOrders,
          value: '0',
          change: 'Error loading data',
          icon: ShoppingCart,
          trend: 'up',
        },
        {
          title: translations.quickStats.revenue,
          value: '$0',
          change: 'Error loading data',
          icon: DollarSign,
          trend: 'up',
        },
        {
          title: translations.quickStats.conversionRate,
          value: '0%',
          change: 'Error loading data',
          icon: TrendingUp,
          trend: 'up',
        },
      ]);
    }
  }, [dashboard.stats, dashboard.loading, dashboard.loaded, translations]);

  if (dashboard.loading || (!dashboard.loaded && stats.length === 0)) {
    return <DashboardSkeleton />;
  }

  const modules: DashboardModule[] = [
    {
      id: 'monitoring',
      title: translations.modules.monitoring.title,
      description: translations.modules.monitoring.description,
      icon: Activity,
      href: '/admin/monitoring',
      disabled: false,
      buttonText: translations.modules.monitoring.viewDashboard,
    },
    {
      id: 'performance',
      title: translations.modules.performance.title,
      description: translations.modules.performance.description,
      icon: TrendingUp,
      href: '/admin/performance',
      disabled: false,
      buttonText: translations.modules.performance.viewMetrics,
    },
    {
      id: 'users',
      title: translations.modules.users.title,
      description: translations.modules.users.description,
      icon: Users,
      href: '/admin/users',
      disabled: false,
      buttonText: 'Manage Users',
    },
    {
      id: 'orders',
      title: translations.modules.orders.title,
      description: translations.modules.orders.description,
      icon: ShoppingCart,
      disabled: true,
      buttonText: translations.modules.orders.comingSoon,
      comingSoonText: translations.modules.orders.comingSoon,
    },
    {
      id: 'analytics',
      title: translations.modules.analytics.title,
      description: translations.modules.analytics.description,
      icon: BarChart3,
      href: '/admin/analytics',
      disabled: false,
      buttonText: 'View Analytics',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
        <p className="text-muted-foreground">
          {translations.description}
        </p>
      </div>

      {/* Quick Stats */}
      <section aria-labelledby="quick-stats-title">
        <h2 id="quick-stats-title" className="text-lg font-semibold mb-4">
          {translations.quickStats.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <QuickStat key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Shopify Integration Status */}
      <section aria-labelledby="shopify-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="shopify-title" className="text-lg font-semibold">
            Shopify Integration
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshShopify}
              disabled={isRefreshing}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleSyncShopify}
              disabled={isRefreshing}
              className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 disabled:opacity-50"
            >
              {isRefreshing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {dashboard.shopifyData ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {dashboard.shopifyData.isConnected
                  ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Connected</span>
                      </>
                    )
                  : (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">Disconnected</span>
                      </>
                    )}
              </div>
              <p className="text-sm text-gray-600">
                Last sync:
                {' '}
                {dashboard.shopifyData.lastSync
                  ? new Date(dashboard.shopifyData.lastSync).toLocaleString()
                  : 'Never'}
              </p>
            </div>

            {/* Shopify Metrics */}
            {dashboard.shopifyData.shopifyData && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Shopify Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{dashboard.shopifyData.shopifyData.totalOrders}</p>
                  <p className="text-sm text-gray-600">
                    {dashboard.shopifyData.shopifyData.ordersChange}
                    {' '}
                    from last month
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Shopify Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">
                    $
                    {dashboard.shopifyData.shopifyData.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dashboard.shopifyData.shopifyData.revenueChange}
                    {' '}
                    from last month
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Products</span>
                  </div>
                  <p className="text-2xl font-bold">{dashboard.shopifyData.shopifyData.totalProducts}</p>
                  <p className="text-sm text-gray-600">Total products in store</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">Customers</span>
                  </div>
                  <p className="text-2xl font-bold">{dashboard.shopifyData.shopifyData.totalCustomers}</p>
                  <p className="text-sm text-gray-600">Total customers</p>
                </div>
              </div>
            )}

            {/* Sync Health */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Sync Health</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  dashboard.shopifyData.syncHealth.healthStatus === 'healthy'
                    ? 'bg-green-500'
                    : dashboard.shopifyData.syncHealth.healthStatus === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                />
                <span className="capitalize">{dashboard.shopifyData.syncHealth.healthStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Sync Success Rate:</span>
                  <span className="ml-2 font-medium">
                    {dashboard.shopifyData.syncHealth.syncSuccessRate.toFixed(1)}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pending Sync:</span>
                  <span className="ml-2 font-medium">{dashboard.shopifyData.syncHealth.pendingSync}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {(dashboard.shopifyData.shopifyData?.recentOrders?.length ?? 0) > 0 && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Recent Shopify Orders</h3>
                <div className="space-y-2">
                  {dashboard.shopifyData.shopifyData?.recentOrders?.slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">
                          #
                          {order.order_number}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">{order.customer_email}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          $
                          {order.total_price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{order.fulfillment_status || 'unfulfilled'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 border rounded-lg text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading Shopify data...</p>
          </div>
        )}
      </section>

      {/* Main Modules */}
      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-lg font-semibold mb-4">
          Management Modules
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map(module => (
            <ModuleCard
              key={module.id}
              {...module}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
