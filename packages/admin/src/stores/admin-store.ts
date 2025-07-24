/**
 * Admin Store using Zustand
 * Following .cursorrules rule #336: "对于复杂状态使用 Zustand 进行全局状态管理"
 */

import type { AdminStoreActions, AdminStoreState } from '../types';
import { create } from 'zustand';

type AdminStore = {
  actions: AdminStoreActions;
} & AdminStoreState;

export const useAdminStore = create<AdminStore>((set, get) => ({
  // State
  currentUser: null,
  permissions: [],
  modules: {},
  dashboard: {
    stats: null,
    realtimeStats: null,
    conversionData: null,
    shopifyData: null,
    modules: [],
    loaded: false,
    loading: false,
  },

  // Actions
  actions: {
    setUser: user => set({ currentUser: user }),

    setPermissions: permissions => set({ permissions }),

    loadModule: async (module: string) => {
      const state = get();

      // Update module loading state
      set({
        modules: {
          ...state.modules,
          [module]: {
            enabled: true,
            config: {},
            lastUpdated: new Date().toISOString(),
            loaded: false,
            loading: true,
            data: undefined,
            error: undefined,
          },
        },
      });

      try {
        // Real API call for module data
        const response = await fetch(`/api/admin/modules/${module}`);

        if (!response.ok) {
          throw new Error(`Failed to load module: ${response.statusText}`);
        }

        const moduleData = await response.json();

        set({
          modules: {
            ...state.modules,
            [module]: {
              enabled: true,
              config: {},
              lastUpdated: new Date().toISOString(),
              loaded: true,
              loading: false,
              data: moduleData,
              error: undefined,
            },
          },
        });
      } catch (error) {
        set({
          modules: {
            ...state.modules,
            [module]: {
              enabled: true,
              config: {},
              lastUpdated: new Date().toISOString(),
              loaded: false,
              loading: false,
              data: undefined,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      }
    },

    loadDashboardStats: async () => {
      const state = get();

      set({
        dashboard: { ...state.dashboard, loading: true },
      });

      try {
        // Real API call for dashboard stats
        const response = await fetch('/api/admin/dashboard/stats');

        if (!response.ok) {
          throw new Error(`Failed to load dashboard stats: ${response.statusText}`);
        }

        const stats = await response.json();

        set({
          dashboard: {
            ...state.dashboard,
            stats,
            loaded: true,
            loading: false,
          },
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        set({
          dashboard: {
            ...state.dashboard,
            loading: false,
            loaded: false,
          },
        });
      }
    },

    loadRealtimeStats: async () => {
      const state = get();

      try {
        // Real API call for realtime stats
        const response = await fetch('/api/admin/dashboard/realtime');

        if (!response.ok) {
          throw new Error(`Failed to load realtime stats: ${response.statusText}`);
        }

        const realtimeStats = await response.json();

        set({
          dashboard: {
            ...state.dashboard,
            realtimeStats,
          },
        });
      } catch (error) {
        console.error('Failed to load realtime stats:', error);
        // Don't throw error for realtime stats - it's non-critical
      }
    },

    loadConversionData: async () => {
      const state = get();

      try {
        // Real API call for conversion data
        const response = await fetch('/api/admin/dashboard/conversions');

        if (!response.ok) {
          throw new Error(`Failed to load conversion data: ${response.statusText}`);
        }

        const conversionData = await response.json();

        set({
          dashboard: {
            ...state.dashboard,
            conversionData,
          },
        });
      } catch (error) {
        console.error('Failed to load conversion data:', error);
        // Don't throw error for conversion data - it's non-critical
      }
    },

    loadShopifyData: async () => {
      const state = get();

      try {
        // Real API call for Shopify data
        const response = await fetch('/api/admin/dashboard/shopify');

        if (!response.ok) {
          throw new Error(`Failed to load Shopify data: ${response.statusText}`);
        }

        const shopifyData = await response.json();

        set({
          dashboard: {
            ...state.dashboard,
            shopifyData,
          },
        });
      } catch (error) {
        console.error('Failed to load Shopify data:', error);
        // Don't throw error for Shopify data - it's non-critical
        set({
          dashboard: {
            ...state.dashboard,
            shopifyData: {
              error: error instanceof Error ? error.message : 'Unknown error',
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
              recentActivity: {
                syncedLast24h: 0,
                totalLast24h: 0,
                recentSyncRate: 0,
                avgSyncTimeMinutes: 0,
              },
              errors: {
                errorCount: 1,
                lastError: error instanceof Error ? error.message : 'Unknown error',
                lastErrorAt: new Date().toISOString(),
              },
              fulfillment: [],
              pendingOrders: {
                count: 0,
                oldestPendingAt: null,
              },
            },
          },
        });
      }
    },

    syncShopifyData: async () => {
      try {
        // Trigger Shopify sync
        const response = await fetch('/api/admin/dashboard/shopify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'sync' }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync Shopify data: ${response.statusText}`);
        }

        // Refresh Shopify data after sync
        await get().actions.loadShopifyData();

        return { success: true };
      } catch (error) {
        console.error('Failed to sync Shopify data:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    updateModuleState: (module: string, newState) => {
      const state = get();
      const currentModule = state.modules[module] || {
        enabled: true,
        config: {},
        lastUpdated: new Date().toISOString(),
        loaded: false,
        loading: false,
        data: undefined,
        error: undefined,
      };
      set({
        modules: {
          ...state.modules,
          [module]: { ...currentModule, ...newState },
        },
      });
    },
  },
}));
