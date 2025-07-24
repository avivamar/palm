/**
 * Shopify Store - Zustand State Management
 * Shopify 状态管理 - 订单、库存、同步状态的集中管理
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Types
export type ShopifyOrder = {
  id: string;
  orderId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  lastAttempt: string;
  errorMessage?: string;
  shopifyOrderId?: string;
  metadata?: {
    webhookEventId?: string;
    stripePaymentId?: string;
  };
};

export type InventoryItem = {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  lastUpdated: string;
  shopifyProductId?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  trend: { value: number; type: 'increase' | 'decrease' | 'stable' };
  price: number;
  currency: string;
};

export type SyncLogEntry = {
  id: string;
  timestamp: string;
  type: 'order_sync' | 'inventory_sync' | 'product_sync' | 'webhook' | 'manual_sync';
  status: 'success' | 'warning' | 'error' | 'in_progress';
  source: string;
  target: string;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  duration: number;
  message: string;
  details?: string;
  errorCode?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
};

export type HealthMetric = {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: string;
  description: string;
  lastCheck: string;
  responseTime?: number;
  uptime?: number;
  errorRate?: number;
  trend?: { value: number; type: 'increase' | 'decrease' | 'stable' };
};

export type ShopifyMetrics = {
  totalOrders: number;
  syncedToday: number;
  pendingSync: number;
  inventoryItems: number;
  lastSyncTime: string;
  syncStatus: 'success' | 'warning' | 'error' | 'syncing';
  trends: {
    orders: { value: number; type: 'increase' | 'decrease' };
    sync: { value: number; type: 'increase' | 'decrease' };
    inventory: { value: number; type: 'increase' | 'decrease' };
  };
};

export type ShopifyState = {
  // Data
  orders: ShopifyOrder[];
  inventory: InventoryItem[];
  syncLogs: SyncLogEntry[];
  healthMetrics: HealthMetric[];
  metrics: ShopifyMetrics;

  // UI State
  isLoading: boolean;
  error: string | null;
  selectedOrders: string[];
  selectedInventoryItems: string[];

  // Filters
  orderFilter: 'all' | 'pending' | 'syncing' | 'completed' | 'failed';
  inventoryFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  logFilter: 'all' | 'success' | 'warning' | 'error' | 'in_progress';

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Order actions
  setOrders: (orders: ShopifyOrder[]) => void;
  updateOrder: (orderId: string, updates: Partial<ShopifyOrder>) => void;
  retryOrderSync: (orderId: string) => Promise<void>;
  setSelectedOrders: (orderIds: string[]) => void;
  setOrderFilter: (filter: ShopifyState['orderFilter']) => void;

  // Inventory actions
  setInventory: (inventory: InventoryItem[]) => void;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  bulkUpdateInventory: (updates: Array<{ id: string; stock: number }>) => Promise<void>;
  setSelectedInventoryItems: (itemIds: string[]) => void;
  setInventoryFilter: (filter: ShopifyState['inventoryFilter']) => void;

  // Sync logs actions
  setSyncLogs: (logs: SyncLogEntry[]) => void;
  addSyncLog: (log: SyncLogEntry) => void;
  setLogFilter: (filter: ShopifyState['logFilter']) => void;

  // Health metrics actions
  setHealthMetrics: (metrics: HealthMetric[]) => void;
  updateHealthMetric: (metricId: string, updates: Partial<HealthMetric>) => void;

  // Metrics actions
  setMetrics: (metrics: ShopifyMetrics) => void;
  updateMetrics: (updates: Partial<ShopifyMetrics>) => void;

  // Sync actions
  syncAllOrders: () => Promise<void>;
  syncInventory: () => Promise<void>;
  runHealthCheck: () => Promise<void>;

  // Utility actions
  refreshAllData: () => Promise<void>;
  clearFilters: () => void;
};

export const useShopifyStore = create<ShopifyState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      orders: [],
      inventory: [],
      syncLogs: [],
      healthMetrics: [],
      metrics: {
        totalOrders: 0,
        syncedToday: 0,
        pendingSync: 0,
        inventoryItems: 0,
        lastSyncTime: '',
        syncStatus: 'success',
        trends: {
          orders: { value: 0, type: 'increase' },
          sync: { value: 0, type: 'increase' },
          inventory: { value: 0, type: 'increase' },
        },
      },

      isLoading: false,
      error: null,
      selectedOrders: [],
      selectedInventoryItems: [],

      orderFilter: 'all',
      inventoryFilter: 'all',
      logFilter: 'all',

      // Basic actions
      setLoading: loading => set({ isLoading: loading }),
      setError: error => set({ error }),

      // Order actions
      setOrders: orders => set({ orders }),
      updateOrder: (orderId, updates) =>
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order,
          ),
        })),

      retryOrderSync: async (orderId) => {
        const { updateOrder, addSyncLog } = get();

        // Update order status to syncing
        updateOrder(orderId, {
          status: 'syncing',
          attempts: get().orders.find(o => o.id === orderId)!.attempts + 1,
          lastAttempt: 'Just now',
        });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));

          const success = Math.random() > 0.3; // 70% success rate

          if (success) {
            const shopifyOrderId = `SH-${Math.floor(Math.random() * 9999)}`;
            updateOrder(orderId, {
              status: 'completed',
              shopifyOrderId,
              errorMessage: undefined,
            });

            addSyncLog({
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'order_sync',
              status: 'success',
              source: 'Admin Panel',
              target: 'Shopify Orders',
              recordsProcessed: 1,
              recordsSuccessful: 1,
              recordsFailed: 0,
              duration: 2.1,
              message: `Order ${orderId} successfully synced to Shopify`,
              metadata: { orderId, shopifyOrderId },
            });
          } else {
            updateOrder(orderId, {
              status: 'failed',
              errorMessage: 'Product variant not found in Shopify catalog',
            });

            addSyncLog({
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'order_sync',
              status: 'error',
              source: 'Admin Panel',
              target: 'Shopify Orders',
              recordsProcessed: 1,
              recordsSuccessful: 0,
              recordsFailed: 1,
              duration: 1.8,
              message: `Failed to sync order ${orderId}`,
              details: 'Product variant not found in Shopify catalog',
              errorCode: 'PRODUCT_NOT_FOUND',
              metadata: { orderId },
            });
          }
        } catch (error) {
          updateOrder(orderId, {
            status: 'failed',
            errorMessage: 'Network error occurred during sync',
          });
        }
      },

      setSelectedOrders: orderIds => set({ selectedOrders: orderIds }),
      setOrderFilter: filter => set({ orderFilter: filter }),

      // Inventory actions
      setInventory: inventory => set({ inventory }),
      updateInventoryItem: (itemId, updates) =>
        set(state => ({
          inventory: state.inventory.map(item =>
            item.id === itemId ? { ...item, ...updates, lastUpdated: 'Just now' } : item,
          ),
        })),

      bulkUpdateInventory: async (updates) => {
        const { updateInventoryItem, addSyncLog } = get();

        set({ isLoading: true });

        try {
          // Simulate bulk update
          for (const update of updates) {
            updateInventoryItem(update.id, {
              currentStock: update.stock,
              availableStock: update.stock - (get().inventory.find(i => i.id === update.id)?.reservedStock || 0),
              status: update.stock === 0
                ? 'out_of_stock'
                : update.stock <= (get().inventory.find(i => i.id === update.id)?.lowStockThreshold || 0) ? 'low_stock' : 'in_stock',
            });
          }

          addSyncLog({
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'inventory_sync',
            status: 'success',
            source: 'Admin Panel',
            target: 'Shopify Inventory',
            recordsProcessed: updates.length,
            recordsSuccessful: updates.length,
            recordsFailed: 0,
            duration: updates.length * 0.5,
            message: `Bulk inventory update completed for ${updates.length} items`,
            metadata: { updatedItems: updates.length },
          });
        } catch (error) {
          set({ error: 'Failed to update inventory' });
        } finally {
          set({ isLoading: false });
        }
      },

      setSelectedInventoryItems: itemIds => set({ selectedInventoryItems: itemIds }),
      setInventoryFilter: filter => set({ inventoryFilter: filter }),

      // Sync logs actions
      setSyncLogs: logs => set({ syncLogs: logs }),
      addSyncLog: log =>
        set(state => ({
          syncLogs: [log, ...state.syncLogs],
        })),
      setLogFilter: filter => set({ logFilter: filter }),

      // Health metrics actions
      setHealthMetrics: metrics => set({ healthMetrics: metrics }),
      updateHealthMetric: (metricId, updates) =>
        set(state => ({
          healthMetrics: state.healthMetrics.map(metric =>
            metric.id === metricId ? { ...metric, ...updates, lastCheck: 'Just now' } : metric,
          ),
        })),

      // Metrics actions
      setMetrics: metrics => set({ metrics }),
      updateMetrics: updates =>
        set(state => ({
          metrics: { ...state.metrics, ...updates },
        })),

      // Sync actions
      syncAllOrders: async () => {
        const { orders, retryOrderSync, addSyncLog } = get();
        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'failed');

        set({ isLoading: true });

        try {
          addSyncLog({
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'manual_sync',
            status: 'in_progress',
            source: 'Admin Panel',
            target: 'Shopify Full Sync',
            recordsProcessed: pendingOrders.length,
            recordsSuccessful: 0,
            recordsFailed: 0,
            duration: 0,
            message: `Started bulk sync for ${pendingOrders.length} orders`,
            metadata: { totalOrders: pendingOrders.length },
          });

          for (const order of pendingOrders) {
            await retryOrderSync(order.id);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      syncInventory: async () => {
        const { inventory, addSyncLog, updateMetrics } = get();

        set({ isLoading: true });

        try {
          // Simulate inventory sync
          await new Promise(resolve => setTimeout(resolve, 2000));

          addSyncLog({
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'inventory_sync',
            status: 'success',
            source: 'Admin Panel',
            target: 'Shopify Inventory',
            recordsProcessed: inventory.length,
            recordsSuccessful: inventory.length,
            recordsFailed: 0,
            duration: 3.2,
            message: `Inventory sync completed for ${inventory.length} items`,
            metadata: { totalItems: inventory.length },
          });

          updateMetrics({ lastSyncTime: 'Just now' });
        } finally {
          set({ isLoading: false });
        }
      },

      runHealthCheck: async () => {
        const { updateHealthMetric } = get();

        set({ isLoading: true });

        try {
          // Simulate health check
          await new Promise(resolve => setTimeout(resolve, 1000));

          const healthUpdates = [
            { id: 'shopify-api', responseTime: 180 + Math.random() * 40 },
            { id: 'database', uptime: 99.9 + Math.random() * 0.09 },
            { id: 'webhook-processing', errorRate: Math.random() * 2 },
            { id: 'sync-service', status: 'healthy' as const },
          ];

          healthUpdates.forEach((update) => {
            updateHealthMetric(update.id, update);
          });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshAllData: async () => {
        const { syncInventory, runHealthCheck } = get();

        set({ isLoading: true, error: null });

        try {
          await Promise.all([
            syncInventory(),
            runHealthCheck(),
          ]);
        } catch (error) {
          set({ error: 'Failed to refresh data' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearFilters: () =>
        set({
          orderFilter: 'all',
          inventoryFilter: 'all',
          logFilter: 'all',
          selectedOrders: [],
          selectedInventoryItems: [],
        }),
    })),
    {
      name: 'shopify-store',
    },
  ),
);

// Selectors for filtered data
export const useFilteredOrders = () => {
  return useShopifyStore((state) => {
    const { orders, orderFilter } = state;
    return orderFilter === 'all'
      ? orders
      : orders.filter(order => order.status === orderFilter);
  });
};

export const useFilteredInventory = () => {
  return useShopifyStore((state) => {
    const { inventory, inventoryFilter } = state;
    return inventoryFilter === 'all'
      ? inventory
      : inventory.filter(item => item.status === inventoryFilter);
  });
};

export const useFilteredLogs = () => {
  return useShopifyStore((state) => {
    const { syncLogs, logFilter } = state;
    return logFilter === 'all'
      ? syncLogs
      : syncLogs.filter(log => log.status === logFilter);
  });
};

// Computed selectors
export const useShopifyStats = () => {
  return useShopifyStore((state) => {
    const { orders, inventory, syncLogs } = state;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      failedOrders: orders.filter(o => o.status === 'failed').length,
      lowStockItems: inventory.filter(i => i.status === 'low_stock').length,
      outOfStockItems: inventory.filter(i => i.status === 'out_of_stock').length,
      recentErrors: syncLogs.filter(l => l.status === 'error').length,
      totalInventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0),
    };
  });
};
