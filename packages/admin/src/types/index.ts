/**
 * Admin package types
 * Following .cursorrules rule #17: "所有类型定义集中管理在 types/ 目录"
 */

// Temporary shared types (to be replaced with @rolitt/shared later)
export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  createdAt: string;
};

export type ModuleState = {
  enabled: boolean;
  config: Record<string, any>;
  lastUpdated: string;
  loaded?: boolean;
  loading?: boolean;
  data?: any;
  error?: string;
};

// Dashboard specific types
export type QuickStatProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
};

export type ModuleCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  disabled?: boolean;
  locale: string;
  buttonText: string;
  comingSoonText?: string;
};

// Dashboard data types
export type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  conversionRate: number;
  totalUsersChange: string;
  totalOrdersChange: string;
  revenueChange: string;
  conversionRateChange: string;
};

export type RealtimeStats = {
  timestamp: string;
  webhookEvents: {
    last24Hours: number;
    successRate: number;
    failed: number;
  };
  recentActivity: {
    ordersLastHour: number;
    revenueLastHour: number;
    usersLastHour: number;
    activeSessions: number;
  };
  systemHealth: {
    healthScore: number;
    pendingOrders: number;
    processingOrders: number;
    failedWebhooks: number;
    status: 'healthy' | 'warning' | 'critical';
  };
};

export type ConversionData = {
  funnel: {
    totalUsers: number;
    initiatedOrders: number;
    completedOrders: number;
    visitToOrderRate: number;
    orderToPaymentRate: number;
    overallConversionRate: number;
  };
  conversionRates: {
    overall: number;
    orderCompletion: number;
    last30Days: number;
    last7Days: number;
  };
  periodComparison: {
    allTime: { users: number; orders: number; conversionRate: number };
    last30Days: { users: number; orders: number; conversionRate: number };
    last7Days: { users: number; orders: number; conversionRate: number };
  };
  productPerformance: Array<{
    color: string;
    initiated: number;
    completed: number;
    conversionRate: number;
  }>;
  revenueMetrics: {
    averageOrderValue: number;
    totalRevenue: number;
    revenuePerUser: number;
  };
};

export type ShopifyData = {
  isConnected: boolean;
  lastSync: string | null;
  error?: string;
  shopifyData: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    ordersChange: string;
    revenueChange: string;
    shopInfo: {
      name: string;
      domain: string;
      currency: string;
      country: string;
      plan_name: string;
    } | null;
    recentOrders: Array<{
      id: string;
      order_number: string;
      customer_email: string;
      total_price: number;
      created_at: string;
      financial_status: string;
      fulfillment_status: string;
      currency: string;
    }>;
    inventoryLevels: Array<{
      id: string;
      title: string;
      handle: string;
      total_inventory: number;
      variants_count: number;
    }>;
  } | null;
  syncHealth: {
    healthStatus: 'healthy' | 'warning' | 'critical';
    syncSuccessRate: number;
    totalOrders: number;
    syncedOrders: number;
    pendingSync: number;
  };
  recentActivity: {
    syncedLast24h: number;
    totalLast24h: number;
    recentSyncRate: number;
    avgSyncTimeMinutes: number;
  };
  errors: {
    errorCount: number;
    lastError: string | null;
    lastErrorAt: string | null;
  };
  fulfillment: Array<{
    status: string;
    count: number;
  }>;
  pendingOrders: {
    count: number;
    oldestPendingAt: string | null;
  };
};

export type DashboardModule = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  disabled: boolean;
  buttonText: string;
  comingSoonText?: string;
};

// Admin store state
export type AdminStoreState = {
  currentUser: AdminUser | null;
  permissions: string[];
  modules: Record<string, ModuleState>;
  dashboard: {
    stats: DashboardStats | null;
    realtimeStats: RealtimeStats | null;
    conversionData: ConversionData | null;
    shopifyData: ShopifyData | null;
    modules: DashboardModule[];
    loaded: boolean;
    loading: boolean;
  };
};

// Admin store actions
export type AdminStoreActions = {
  setUser: (user: AdminUser | null) => void;
  setPermissions: (permissions: string[]) => void;
  loadModule: (module: string) => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadRealtimeStats: () => Promise<void>;
  loadConversionData: () => Promise<void>;
  loadShopifyData: () => Promise<void>;
  syncShopifyData: () => Promise<{ success: boolean; error?: string }>;
  updateModuleState: (module: string, state: Partial<ModuleState>) => void;
};
