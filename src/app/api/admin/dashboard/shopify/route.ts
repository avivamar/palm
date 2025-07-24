/**
 * Shopify Dashboard Integration API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { loadConfigFromEnv, ShopifyClient, ShopifyErrorHandler } from '@rolitt/shopify';
import { and, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema } from '@/models/Schema';

export async function GET() {
  try {
    // Verify admin access
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDB();

    // Calculate time ranges for analysis
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Initialize Shopify client for real-time data
    const config = loadConfigFromEnv();
    let shopifyData = null;
    let isShopifyConnected = false;

    if (config) {
      try {
        const client = new ShopifyClient(config);

        // Execute Shopify API calls in parallel with error handling
        const [
          ordersThisMonth,
          ordersLastMonth,
          productsCount,
          customersCount,
          shopInfo,
        ] = await Promise.all([
          // Orders this month with retry logic
          ShopifyErrorHandler.createRetryableApiCall(
            () => client.request('GET', '/admin/api/2025-01/orders.json', {
              created_at_min: startOfCurrentMonth.toISOString(),
              limit: 250,
              status: 'any',
              financial_status: 'paid',
            }),
            'FetchOrdersThisMonth',
            { timeRange: 'currentMonth' },
          ).catch((error) => {
            console.error('Failed to fetch orders this month:', error);
            return { orders: [] };
          }),

          // Orders last month with retry logic
          ShopifyErrorHandler.createRetryableApiCall(
            () => client.request('GET', '/admin/api/2025-01/orders.json', {
              created_at_min: startOfLastMonth.toISOString(),
              created_at_max: endOfLastMonth.toISOString(),
              limit: 250,
              status: 'any',
              financial_status: 'paid',
            }),
            'FetchOrdersLastMonth',
            { timeRange: 'lastMonth' },
          ).catch((error) => {
            console.error('Failed to fetch orders last month:', error);
            return { orders: [] };
          }),

          // Products count with retry logic
          ShopifyErrorHandler.createRetryableApiCall(
            () => client.request('GET', '/admin/api/2025-01/products/count.json'),
            'FetchProductsCount',
          ).catch((error) => {
            console.error('Failed to fetch products count:', error);
            return { count: 0 };
          }),

          // Customers count with retry logic
          ShopifyErrorHandler.createRetryableApiCall(
            () => client.request('GET', '/admin/api/2025-01/customers/count.json'),
            'FetchCustomersCount',
          ).catch((error) => {
            console.error('Failed to fetch customers count:', error);
            return { count: 0 };
          }),

          // Shop info with retry logic
          ShopifyErrorHandler.createRetryableApiCall(
            () => client.request('GET', '/admin/api/2025-01/shop.json'),
            'FetchShopInfo',
          ).catch((error) => {
            console.error('Failed to fetch shop info:', error);
            return { shop: null };
          }),
        ]);

        // Process orders data
        const currentMonthOrders = ordersThisMonth.orders || [];
        const lastMonthOrders = ordersLastMonth.orders || [];

        // Calculate revenue
        const currentMonthRevenue = currentMonthOrders.reduce((sum: number, order: any) => {
          return sum + Number.parseFloat(order.total_price || '0');
        }, 0);

        const lastMonthRevenue = lastMonthOrders.reduce((sum: number, order: any) => {
          return sum + Number.parseFloat(order.total_price || '0');
        }, 0);

        // Helper function to calculate percentage changes
        const calculateChange = (current: number, previous: number): string => {
          if (previous === 0) {
            return current > 0 ? '+100%' : '0%';
          }
          const change = ((current - previous) / previous) * 100;
          return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        };

        // Get recent orders for activity feed
        const recentOrders = currentMonthOrders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((order: any) => ({
            id: order.id,
            order_number: order.order_number,
            customer_email: order.email,
            total_price: Number.parseFloat(order.total_price || '0'),
            created_at: order.created_at,
            financial_status: order.financial_status,
            fulfillment_status: order.fulfillment_status,
            currency: order.currency,
          }));

        // Get inventory levels for top products with retry logic
        const topProducts = await ShopifyErrorHandler.createRetryableApiCall(
          () => client.request('GET', '/admin/api/2025-01/products.json', {
            limit: 10,
            fields: 'id,title,handle,variants',
          }),
          'FetchTopProducts',
        ).catch((error) => {
          console.error('Failed to fetch top products:', error);
          return { products: [] };
        });

        const inventoryLevels = topProducts.products?.map((product: any) => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          total_inventory: product.variants?.reduce((sum: number, variant: any) => {
            return sum + (variant.inventory_quantity || 0);
          }, 0) || 0,
          variants_count: product.variants?.length || 0,
        })) || [];

        shopifyData = {
          // Core metrics
          totalOrders: currentMonthOrders.length,
          totalRevenue: currentMonthRevenue,
          totalProducts: productsCount.count || 0,
          totalCustomers: customersCount.count || 0,

          // Month-over-month changes
          ordersChange: calculateChange(currentMonthOrders.length, lastMonthOrders.length),
          revenueChange: calculateChange(currentMonthRevenue, lastMonthRevenue),

          // Shop information
          shopInfo: shopInfo.shop
            ? {
                name: shopInfo.shop.name,
                domain: shopInfo.shop.domain,
                currency: shopInfo.shop.currency,
                country: shopInfo.shop.country,
                plan_name: shopInfo.shop.plan_name,
              }
            : null,

          // Recent activity
          recentOrders,

          // Inventory status
          inventoryLevels,
        };

        isShopifyConnected = true;
      } catch (error) {
        console.error('Shopify API error:', error);
        isShopifyConnected = false;
      }
    }

    // Execute database queries in parallel
    const [
      shopifySyncStatsResult,
      recentSyncResult,
      syncErrorsResult,
      fulfillmentStatusResult,
      pendingSyncResult,
    ] = await Promise.all([
      // Overall Shopify sync statistics
      db.select({
        totalOrders: sql<number>`count(*)`,
        syncedOrders: sql<number>`count(case when ${preordersSchema.shopifyOrderId} is not null then 1 end)`,
        completedOrders: sql<number>`count(case when ${preordersSchema.status} = 'completed' then 1 end)`,
        syncRate: sql<number>`(count(case when ${preordersSchema.shopifyOrderId} is not null then 1 end) * 100.0 / count(*))`,
      }).from(preordersSchema).where(eq(preordersSchema.status, 'completed')),

      // Recent Shopify sync activity (last 24 hours)
      db.select({
        syncedLast24h: sql<number>`count(case when ${preordersSchema.shopifySyncedAt} >= ${last24Hours} then 1 end)`,
        totalLast24h: sql<number>`count(*)`,
        avgSyncTime: sql<number>`avg(extract(epoch from (${preordersSchema.shopifySyncedAt} - ${preordersSchema.createdAt})) / 60)`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, last24Hours),
      )),

      // Shopify sync errors in last 7 days
      db.select({
        errorCount: sql<number>`count(*)`,
        lastError: sql<string>`max(${preordersSchema.shopifyError})`,
        lastErrorAt: sql<string>`max(${preordersSchema.shopifyLastAttemptAt})`,
      }).from(preordersSchema).where(and(
        isNotNull(preordersSchema.shopifyError),
        gte(preordersSchema.shopifyLastAttemptAt, last7Days),
      )),

      // Fulfillment status breakdown
      db.select({
        fulfillmentStatus: preordersSchema.shopifyFulfillmentStatus,
        count: sql<number>`count(*)`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        isNotNull(preordersSchema.shopifyOrderId),
      )).groupBy(preordersSchema.shopifyFulfillmentStatus),

      // Orders pending Shopify sync
      db.select({
        pendingCount: sql<number>`count(*)`,
        oldestPending: sql<string>`min(${preordersSchema.createdAt})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        sql`${preordersSchema.shopifyOrderId} is null`,
      )),
    ]);

    // Process database results
    const syncStats = shopifySyncStatsResult[0] || { totalOrders: 0, syncedOrders: 0, completedOrders: 0, syncRate: 0 };
    const recentSync = recentSyncResult[0] || { syncedLast24h: 0, totalLast24h: 0, avgSyncTime: 0 };
    const syncErrors = syncErrorsResult[0] || { errorCount: 0, lastError: null, lastErrorAt: null };
    const pendingSync = pendingSyncResult[0] || { pendingCount: 0, oldestPending: null };

    // Calculate health metrics
    const syncSuccessRate = Number(syncStats.syncRate) || 0;
    const recentSyncRate = recentSync.totalLast24h > 0 ? (recentSync.syncedLast24h / recentSync.totalLast24h) * 100 : 100;
    const hasRecentErrors = syncErrors.errorCount > 0;

    // Determine overall health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (syncSuccessRate < 90 || hasRecentErrors) {
      healthStatus = 'warning';
    }
    if (syncSuccessRate < 70 || pendingSync.pendingCount > 50) {
      healthStatus = 'critical';
    }

    // Process fulfillment status
    const fulfillmentBreakdown = fulfillmentStatusResult.map((item: any) => ({
      status: item.fulfillmentStatus || 'unfulfilled',
      count: item.count,
    }));

    return NextResponse.json({
      // Shopify connection status
      isConnected: isShopifyConnected,
      lastSync: now.toISOString(),

      // Real-time Shopify data (if available)
      shopifyData,

      // Sync status and health metrics
      syncHealth: {
        healthStatus,
        syncSuccessRate,
        totalOrders: syncStats.totalOrders,
        syncedOrders: syncStats.syncedOrders,
        pendingSync: pendingSync.pendingCount,
      },

      // Recent activity
      recentActivity: {
        syncedLast24h: recentSync.syncedLast24h,
        totalLast24h: recentSync.totalLast24h,
        recentSyncRate,
        avgSyncTimeMinutes: Number(recentSync.avgSyncTime) || 0,
      },

      // Error tracking
      errors: {
        errorCount: syncErrors.errorCount,
        lastError: syncErrors.lastError,
        lastErrorAt: syncErrors.lastErrorAt,
      },

      // Fulfillment status
      fulfillment: fulfillmentBreakdown,

      // Pending orders
      pendingOrders: {
        count: pendingSync.pendingCount,
        oldestPendingAt: pendingSync.oldestPending,
      },
    });
  } catch (error) {
    console.error('Failed to fetch Shopify dashboard data:', error);
    return NextResponse.json({
      error: 'Failed to fetch Shopify dashboard data',
      isConnected: false,
      lastSync: null,
      shopifyData: null,
      syncHealth: {
        healthStatus: 'critical',
        syncSuccessRate: 0,
        totalOrders: 0,
        syncedOrders: 0,
        pendingSync: 0,
      },
    }, { status: 500 });
  }
}
