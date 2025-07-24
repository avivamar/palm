/**
 * Automated Data Cleanup Service
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

import { and, eq, lt, sql } from 'drizzle-orm';
import { cacheManager } from '@/libs/cache-manager';
import { getSafeDB } from '@/libs/DB';
import { preordersSchema, usersSchema, webhookLogsSchema } from '@/models/Schema';

type CleanupConfig = {
  webhookLogs: {
    retentionDays: number;
    maxRecords: number;
    deleteSuccessfulOlderThan: number; // days
  };
  preorders: {
    deleteFailedOlderThan: number; // days
    deleteCancelledOlderThan: number; // days
  };
  cache: {
    clearStaleKeys: boolean;
    maxAge: number; // seconds
  };
  users: {
    deleteUnverifiedOlderThan: number; // days
    cleanupOrphanedRecords: boolean;
  };
};

const DEFAULT_CLEANUP_CONFIG: CleanupConfig = {
  webhookLogs: {
    retentionDays: 30,
    maxRecords: 10000,
    deleteSuccessfulOlderThan: 7,
  },
  preorders: {
    deleteFailedOlderThan: 30,
    deleteCancelledOlderThan: 90,
  },
  cache: {
    clearStaleKeys: true,
    maxAge: 3600, // 1 hour
  },
  users: {
    deleteUnverifiedOlderThan: 30,
    cleanupOrphanedRecords: true,
  },
};

type CleanupResult = {
  totalRecordsProcessed: number;
  recordsDeleted: number;
  bytesFreed: number;
  duration: number;
  errors: string[];
  details: {
    webhookLogs: number;
    preorders: number;
    cacheKeys: number;
    users: number;
    orphanedRecords: number;
  };
};

export class DataCleanupService {
  private config: CleanupConfig;
  private isRunning: boolean = false;

  constructor(config: Partial<CleanupConfig> = {}) {
    this.config = { ...DEFAULT_CLEANUP_CONFIG, ...config };
  }

  /**
   * Run complete data cleanup process
   */
  async runFullCleanup(): Promise<CleanupResult> {
    if (this.isRunning) {
      throw new Error('Cleanup process is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();

    console.log('🧹 Starting automated data cleanup...');

    const result: CleanupResult = {
      totalRecordsProcessed: 0,
      recordsDeleted: 0,
      bytesFreed: 0,
      duration: 0,
      errors: [],
      details: {
        webhookLogs: 0,
        preorders: 0,
        cacheKeys: 0,
        users: 0,
        orphanedRecords: 0,
      },
    };

    try {
      // Run cleanup operations in sequence
      const webhookResult = await this.cleanupWebhookLogs();
      result.details.webhookLogs = webhookResult.deleted;
      result.recordsDeleted += webhookResult.deleted;

      const preorderResult = await this.cleanupPreorders();
      result.details.preorders = preorderResult.deleted;
      result.recordsDeleted += preorderResult.deleted;

      const userResult = await this.cleanupUsers();
      result.details.users = userResult.deleted;
      result.recordsDeleted += userResult.deleted;

      const orphanedResult = await this.cleanupOrphanedRecords();
      result.details.orphanedRecords = orphanedResult.deleted;
      result.recordsDeleted += orphanedResult.deleted;

      if (this.config.cache.clearStaleKeys) {
        const cacheResult = await this.cleanupCache();
        result.details.cacheKeys = cacheResult.deleted;
      }

      // Database optimization after cleanup
      await this.optimizeDatabase();

      result.duration = Date.now() - startTime;
      result.totalRecordsProcessed = result.recordsDeleted;

      console.log('✅ Data cleanup completed:', {
        duration: `${result.duration}ms`,
        recordsDeleted: result.recordsDeleted,
        details: result.details,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      console.error('❌ Data cleanup failed:', error);
    } finally {
      this.isRunning = false;
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Cleanup old webhook logs
   */
  private async cleanupWebhookLogs(): Promise<{ deleted: number }> {
    console.log('🧹 Cleaning up webhook logs...');

    const db = await getSafeDB();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.webhookLogs.retentionDays);

    const successfulCutoffDate = new Date();
    successfulCutoffDate.setDate(successfulCutoffDate.getDate() - this.config.webhookLogs.deleteSuccessfulOlderThan);

    // Delete old successful webhook logs
    const successfulDeleted = await db
      .delete(webhookLogsSchema)
      .where(
        and(
          eq(webhookLogsSchema.status, 'success'),
          lt(webhookLogsSchema.createdAt, successfulCutoffDate),
        ),
      );

    // Delete old failed webhook logs
    const failedDeleted = await db
      .delete(webhookLogsSchema)
      .where(
        and(
          eq(webhookLogsSchema.status, 'failed'),
          lt(webhookLogsSchema.createdAt, cutoffDate),
        ),
      );

    // Clean up logs exceeding max records limit
    const excessLogs = await db
      .select({ id: webhookLogsSchema.id })
      .from(webhookLogsSchema)
      .orderBy(sql`${webhookLogsSchema.createdAt} DESC`)
      .offset(this.config.webhookLogs.maxRecords);

    let excessDeleted = 0;
    if (excessLogs.length > 0) {
      const excessIds = excessLogs.map((log: any) => log.id);
      excessDeleted = await db
        .delete(webhookLogsSchema)
        .where(sql`${webhookLogsSchema.id} NOT IN (${sql.raw(excessIds.join(','))})`);
    }

    const totalDeleted = (successfulDeleted as any)?.rowCount || 0
      + (failedDeleted as any)?.rowCount || 0
      + excessDeleted;

    console.log(`✅ Webhook logs cleanup: ${totalDeleted} records deleted`);
    return { deleted: totalDeleted };
  }

  /**
   * Cleanup old failed and cancelled preorders
   */
  private async cleanupPreorders(): Promise<{ deleted: number }> {
    console.log('🧹 Cleaning up preorders...');

    const db = await getSafeDB();

    const failedCutoffDate = new Date();
    failedCutoffDate.setDate(failedCutoffDate.getDate() - this.config.preorders.deleteFailedOlderThan);

    const cancelledCutoffDate = new Date();
    cancelledCutoffDate.setDate(cancelledCutoffDate.getDate() - this.config.preorders.deleteCancelledOlderThan);

    // Delete old failed preorders
    const failedDeleted = await db
      .delete(preordersSchema)
      .where(
        and(
          eq(preordersSchema.status, 'failed'),
          lt(preordersSchema.createdAt, failedCutoffDate),
        ),
      );

    // Delete old cancelled preorders
    const cancelledDeleted = await db
      .delete(preordersSchema)
      .where(
        and(
          eq(preordersSchema.status, 'cancelled'),
          lt(preordersSchema.createdAt, cancelledCutoffDate),
        ),
      );

    const totalDeleted = (failedDeleted as any)?.rowCount || 0
      + (cancelledDeleted as any)?.rowCount || 0;

    console.log(`✅ Preorders cleanup: ${totalDeleted} records deleted`);
    return { deleted: totalDeleted };
  }

  /**
   * Cleanup unverified and orphaned users
   */
  private async cleanupUsers(): Promise<{ deleted: number }> {
    console.log('🧹 Cleaning up users...');

    const db = await getSafeDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.users.deleteUnverifiedOlderThan);

    // Delete unverified users older than threshold
    const unverifiedDeleted = await db
      .delete(usersSchema)
      .where(
        and(
          eq(usersSchema.emailVerified, false),
          lt(usersSchema.createdAt, cutoffDate),
        ),
      );

    const totalDeleted = (unverifiedDeleted as any)?.rowCount || 0;

    console.log(`✅ Users cleanup: ${totalDeleted} records deleted`);
    return { deleted: totalDeleted };
  }

  /**
   * Cleanup orphaned records and maintain referential integrity
   */
  private async cleanupOrphanedRecords(): Promise<{ deleted: number }> {
    if (!this.config.users.cleanupOrphanedRecords) {
      return { deleted: 0 };
    }

    console.log('🧹 Cleaning up orphaned records...');

    const db = await getSafeDB();
    let totalDeleted = 0;

    // Clean up webhook logs without corresponding preorders
    const orphanedWebhookLogs = await db
      .delete(webhookLogsSchema)
      .where(
        and(
          sql`${webhookLogsSchema.preorderId} IS NOT NULL`,
          sql`${webhookLogsSchema.preorderId} NOT IN (SELECT id FROM ${preordersSchema})`,
        ),
      );

    totalDeleted += (orphanedWebhookLogs as any)?.rowCount || 0;

    // Clean up preorders without valid users (if userId is set)
    const orphanedPreorders = await db
      .delete(preordersSchema)
      .where(
        and(
          sql`${preordersSchema.userId} IS NOT NULL`,
          sql`${preordersSchema.userId} NOT IN (SELECT id FROM ${usersSchema})`,
        ),
      );

    totalDeleted += (orphanedPreorders as any)?.rowCount || 0;

    console.log(`✅ Orphaned records cleanup: ${totalDeleted} records deleted`);
    return { deleted: totalDeleted };
  }

  /**
   * Cleanup stale cache keys
   */
  private async cleanupCache(): Promise<{ deleted: number }> {
    console.log('🧹 Cleaning up cache...');

    try {
      // Clear stale cache entries
      const healthInfo = await cacheManager.getHealthInfo();

      // Clear cache patterns that are likely stale
      await cacheManager.clear('api'); // Clear API response cache
      await cacheManager.clear('session'); // Clear old sessions
      await cacheManager.clear('db'); // Clear database query cache

      console.log(`✅ Cache cleanup: cleared multiple cache patterns`, { redisHealth: healthInfo.redis });
      return { deleted: 3 }; // Number of cache patterns cleared
    } catch (error) {
      console.error('❌ Cache cleanup failed:', error);
      return { deleted: 0 };
    }
  }

  /**
   * Optimize database after cleanup
   */
  private async optimizeDatabase(): Promise<void> {
    console.log('🔧 Optimizing database...');

    try {
      const db = await getSafeDB();

      // Run VACUUM ANALYZE to reclaim space and update statistics
      await db.execute(sql.raw('VACUUM ANALYZE;'));

      console.log('✅ Database optimization completed');
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
    }
  }

  /**
   * Get cleanup statistics without running cleanup
   */
  async getCleanupStats(): Promise<{
    webhookLogs: { total: number; oldSuccessful: number; oldFailed: number; excess: number };
    preorders: { total: number; oldFailed: number; oldCancelled: number };
    users: { total: number; unverified: number };
    orphanedRecords: { webhookLogs: number; preorders: number };
  }> {
    const db = await getSafeDB();

    const successfulCutoffDate = new Date();
    successfulCutoffDate.setDate(successfulCutoffDate.getDate() - this.config.webhookLogs.deleteSuccessfulOlderThan);

    const failedCutoffDate = new Date();
    failedCutoffDate.setDate(failedCutoffDate.getDate() - this.config.webhookLogs.retentionDays);

    const preorderFailedCutoffDate = new Date();
    preorderFailedCutoffDate.setDate(preorderFailedCutoffDate.getDate() - this.config.preorders.deleteFailedOlderThan);

    const preorderCancelledCutoffDate = new Date();
    preorderCancelledCutoffDate.setDate(preorderCancelledCutoffDate.getDate() - this.config.preorders.deleteCancelledOlderThan);

    const userCutoffDate = new Date();
    userCutoffDate.setDate(userCutoffDate.getDate() - this.config.users.deleteUnverifiedOlderThan);

    const [
      totalWebhookLogs,
      oldSuccessfulLogs,
      oldFailedLogs,
      totalPreorders,
      oldFailedPreorders,
      oldCancelledPreorders,
      totalUsers,
      unverifiedUsers,
      orphanedWebhookLogs,
      orphanedPreorders,
    ] = await Promise.all([
      // Webhook logs stats
      db.select({ count: sql<number>`count(*)` }).from(webhookLogsSchema),
      db.select({ count: sql<number>`count(*)` }).from(webhookLogsSchema).where(and(eq(webhookLogsSchema.status, 'success'), lt(webhookLogsSchema.createdAt, successfulCutoffDate))),
      db.select({ count: sql<number>`count(*)` }).from(webhookLogsSchema).where(and(eq(webhookLogsSchema.status, 'failed'), lt(webhookLogsSchema.createdAt, failedCutoffDate))),

      // Preorders stats
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema),
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(and(eq(preordersSchema.status, 'failed'), lt(preordersSchema.createdAt, preorderFailedCutoffDate))),
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(and(eq(preordersSchema.status, 'cancelled'), lt(preordersSchema.createdAt, preorderCancelledCutoffDate))),

      // Users stats
      db.select({ count: sql<number>`count(*)` }).from(usersSchema),
      db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(and(eq(usersSchema.emailVerified, false), lt(usersSchema.createdAt, userCutoffDate))),

      // Orphaned records stats
      db.select({ count: sql<number>`count(*)` }).from(webhookLogsSchema).where(sql`${webhookLogsSchema.preorderId} IS NOT NULL AND ${webhookLogsSchema.preorderId} NOT IN (SELECT id FROM ${preordersSchema})`),
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(sql`${preordersSchema.userId} IS NOT NULL AND ${preordersSchema.userId} NOT IN (SELECT id FROM ${usersSchema})`),
    ]);

    // Calculate excess webhook logs
    const totalLogs = totalWebhookLogs[0]?.count || 0;
    const excessLogs = Math.max(0, totalLogs - this.config.webhookLogs.maxRecords);

    return {
      webhookLogs: {
        total: totalLogs,
        oldSuccessful: oldSuccessfulLogs[0]?.count || 0,
        oldFailed: oldFailedLogs[0]?.count || 0,
        excess: excessLogs,
      },
      preorders: {
        total: totalPreorders[0]?.count || 0,
        oldFailed: oldFailedPreorders[0]?.count || 0,
        oldCancelled: oldCancelledPreorders[0]?.count || 0,
      },
      users: {
        total: totalUsers[0]?.count || 0,
        unverified: unverifiedUsers[0]?.count || 0,
      },
      orphanedRecords: {
        webhookLogs: orphanedWebhookLogs[0]?.count || 0,
        preorders: orphanedPreorders[0]?.count || 0,
      },
    };
  }

  /**
   * Check if cleanup is currently running
   */
  isCleanupRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const dataCleanupService = new DataCleanupService();

/**
 * API route handler for cleanup operations
 */
export async function runDataCleanupAPI(): Promise<CleanupResult> {
  try {
    const result = await dataCleanupService.runFullCleanup();
    return result;
  } catch (error) {
    console.error('Data cleanup API error:', error);
    throw error;
  }
}

/**
 * Get cleanup statistics API
 */
export async function getCleanupStatsAPI() {
  try {
    const stats = await dataCleanupService.getCleanupStats();
    return stats;
  } catch (error) {
    console.error('Cleanup stats API error:', error);
    throw error;
  }
}

/**
 * Schedule automated cleanup (for use with cron jobs or similar)
 */
export async function scheduleCleanup(config?: {
  intervalHours?: number;
  enableAutoCleanup?: boolean;
}): Promise<void> {
  const { intervalHours = 24, enableAutoCleanup = true } = config || {};

  if (!enableAutoCleanup) {
    console.log('⏸️  Automated cleanup is disabled');
    return;
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`⏰ Scheduling automated cleanup every ${intervalHours} hours`);

  setInterval(async () => {
    try {
      console.log('🤖 Running scheduled data cleanup...');
      const result = await dataCleanupService.runFullCleanup();
      console.log('✅ Scheduled cleanup completed:', {
        duration: result.duration,
        recordsDeleted: result.recordsDeleted,
      });
    } catch (error) {
      console.error('❌ Scheduled cleanup failed:', error);
    }
  }, intervalMs);
}
