/**
 * Subscription Services Index
 * 统一导出订阅相关服务
 * Following CLAUDE.md: "按功能组织开发，不按类型组织"
 */

import { SubscriptionPermissionService } from './PermissionService';
import { SubscriptionSyncService } from './SubscriptionSyncService';
import { UsageTrackingService } from './UsageTrackingService';

export { SubscriptionPermissionService } from './PermissionService';
export type {
  FeatureId,
  ResourceType,
  UsageCheckResult,
} from './PermissionService';
export { SubscriptionSyncService } from './SubscriptionSyncService';

export { UsageTrackingService } from './UsageTrackingService';

export type {
  DailyUsage,
  UsageAnalytics,
} from './UsageTrackingService';

// 便捷的服务实例创建函数
export const createSubscriptionServices = () => ({
  sync: new SubscriptionSyncService(),
  permission: new SubscriptionPermissionService(),
  usage: new UsageTrackingService(),
});
