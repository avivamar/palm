/**
 * Shopify Data Hooks (Simplified)
 * 简化版数据获取 Hook - 基于 useState 的实现
 */

// Import types directly from the store to avoid conflicts
import type {
  HealthMetric,
  InventoryItem,
  ShopifyMetrics,
  ShopifyOrder,
  SyncLogEntry,
} from '../stores/shopify-store';
import { useCallback, useEffect, useState } from 'react';
import { shopifyApiService } from '../services/shopify-api';

// Hook return types
type UseShopifyDataReturn<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UseMutationReturn<T> = {
  mutate: (data: T) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
};

// Data fetching hooks
export function useShopifyOrders(): UseShopifyDataReturn<ShopifyOrder[]> {
  const [data, setData] = useState<ShopifyOrder[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await shopifyApiService.getOrders();
      setData(orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useShopifyMetrics(): UseShopifyDataReturn<ShopifyMetrics> {
  const [data, setData] = useState<ShopifyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await shopifyApiService.getMetrics();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useInventoryItems(): UseShopifyDataReturn<InventoryItem[]> {
  const [data, setData] = useState<InventoryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await shopifyApiService.getInventory();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useSyncLogs(): UseShopifyDataReturn<SyncLogEntry[]> {
  const [data, setData] = useState<SyncLogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await shopifyApiService.getSyncLogs();
      setData(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useHealthMetrics(): UseShopifyDataReturn<HealthMetric[]> {
  const [data, setData] = useState<HealthMetric[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const metrics = await shopifyApiService.getHealthMetrics();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// Mutation hooks
export function useOrderSync(): UseMutationReturn<{ orderId: string }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ orderId }: { orderId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await shopifyApiService.retryOrderSync(orderId);
      // Optionally trigger a refresh or update local state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, isLoading, error, reset };
}

export function useInventoryUpdate(): UseMutationReturn<{ itemId: string; quantity: number }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      await shopifyApiService.updateInventoryItem(itemId, quantity);
      // Optionally trigger a refresh or update local state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, isLoading, error, reset };
}

export function useBulkSync(): UseMutationReturn<{ orderIds: string[] }> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async ({ orderIds }: { orderIds: string[] }) => {
    setIsLoading(true);
    setError(null);
    try {
      await shopifyApiService.bulkSyncOrders(orderIds);
      // Optionally trigger a refresh or update local state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk sync orders');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { mutate, isLoading, error, reset };
}

// Combined hook for all Shopify data
export function useShopifyData() {
  const orders = useShopifyOrders();
  const metrics = useShopifyMetrics();
  const inventory = useInventoryItems();
  const syncLogs = useSyncLogs();
  const healthMetrics = useHealthMetrics();

  const orderSync = useOrderSync();
  const inventoryUpdate = useInventoryUpdate();
  const bulkSync = useBulkSync();

  const isLoading = orders.isLoading || metrics.isLoading || inventory.isLoading
    || syncLogs.isLoading || healthMetrics.isLoading;

  const hasError = !!(orders.error || metrics.error || inventory.error
    || syncLogs.error || healthMetrics.error);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      orders.refetch(),
      metrics.refetch(),
      inventory.refetch(),
      syncLogs.refetch(),
      healthMetrics.refetch(),
    ]);
  }, [orders.refetch, metrics.refetch, inventory.refetch, syncLogs.refetch, healthMetrics.refetch]);

  return {
    // Data
    orders: orders.data,
    metrics: metrics.data,
    inventory: inventory.data,
    syncLogs: syncLogs.data,
    healthMetrics: healthMetrics.data,

    // Loading states
    isLoading,
    hasError,

    // Actions
    refetchAll,
    syncOrder: orderSync.mutate,
    updateInventory: inventoryUpdate.mutate,
    bulkSync: bulkSync.mutate,

    // Mutation states
    isSyncing: orderSync.isLoading,
    isUpdatingInventory: inventoryUpdate.isLoading,
    isBulkSyncing: bulkSync.isLoading,
  };
}
