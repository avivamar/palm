/**
 * Admin Package Main Export
 * Following .cursorrules rule #555: "preferNamedExports": true
 */

// Export components
export { AdminLayoutClient } from './components/AdminLayoutClient';
export { AdminHeader, AdminSidebar } from './components/layout';
export type {
  AdminHeaderProps,
  AdminLayoutTranslations,
  AdminSidebarProps,
  SidebarItem,
} from './components/layout/types';
export { ModuleCard } from './components/ModuleCard';
export { QuickStat } from './components/QuickStat';
// Export features
export { Dashboard } from './features/dashboard/Dashboard';

export { Monitoring } from './features/monitoring';
export type {
  HealthStatus,
  HealthStatusData,
  MonitoringTranslations,
  PaymentAlert,
  PaymentMetrics,
} from './features/monitoring/types';

export { Scripts } from './features/scripts';

export type {
  CoreScriptsData,
  ScriptsTranslations,
  ShopifyStatus,
  SystemHealthData,
} from './features/scripts/types';
export { ShopifyIntegration } from './features/shopify';

export { Users } from './features/users';

export type {
  User,
  UserStats,
  UsersTranslations,
} from './features/users/types';

export { AIManagement } from './features/ai';

export type {
  AIProvider,
  AIModel,
  AIUsageStats,
  AIPromptTemplate,
  AILogEntry,
  AITestResult,
  AIQuotaLimit,
  AICacheConfig,
} from './features/ai/types';

export { EmailManagement } from './features/email';
// Export stores
export { useAdminStore } from './stores/admin-store';
// Export types
export type {
  AdminStoreActions,
  AdminStoreState,
  DashboardModule,
  DashboardStats,
  ModuleCardProps,
  QuickStatProps,
} from './types';
