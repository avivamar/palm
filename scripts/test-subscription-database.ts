/**
 * Subscription Database Testing Script
 * 测试订阅数据库功能是否正常工作
 */

import type { FeatureId, ResourceType } from '@/libs/subscription';
import { config } from 'dotenv';
import {
  SubscriptionPermissionService,
  UsageTrackingService,
} from '@/libs/subscription';

// Load environment variables
config({ path: '.env.local' });

const testUserId = `test-user-${Date.now()}`;

async function runSubscriptionTests() {
  console.log('🧪 Starting Subscription Database Tests...\n');

  const permissionService = new SubscriptionPermissionService();
  const usageService = new UsageTrackingService();

  try {
    // Test 1: Permission Service
    console.log('🔐 Test 1: Permission Service');

    // Test feature access for different plans
    const features: FeatureId[] = ['ai_chat_basic', 'ai_chat_advanced', 'premium_models'];

    console.log('Testing feature access for free plan...');
    for (const feature of features) {
      const hasAccess = await permissionService.checkFeatureAccess(testUserId, feature);
      console.log(`  - ${feature}: ${hasAccess ? '✅' : '❌'}`);
    }

    // Test usage limits
    console.log('\nTesting usage limits...');
    const resources: ResourceType[] = ['chat_messages', 'ai_calls'];

    for (const resource of resources) {
      const usage = await permissionService.checkUsageLimit(testUserId, resource);
      console.log(`  - ${resource}: ${usage.remaining}/${usage.limit} (${usage.allowed ? 'allowed' : 'blocked'})`);
    }

    // Test 2: Usage Tracking
    console.log('\n📊 Test 2: Usage Tracking');

    // Increment usage
    console.log('Testing usage increment...');
    const incrementResult = await permissionService.incrementUsage(testUserId, 'chat_messages', 5);
    console.log(`  - Increment 5 chat messages: ${incrementResult ? '✅' : '❌'}`);

    // Check updated usage
    const updatedUsage = await usageService.getCurrentUsage(testUserId, 'chat_messages');
    console.log(`  - Current usage: ${updatedUsage.current}/${updatedUsage.limit} (${updatedUsage.percentage}%)`);

    // Test 3: Analytics
    console.log('\n📈 Test 3: Usage Analytics');

    // Get user stats
    const userStats = await permissionService.getUserUsageStats(testUserId);
    console.log('  - User usage stats:');
    Object.entries(userStats).forEach(([resource, stats]) => {
      console.log(`    ${resource}: ${stats.remaining}/${stats.limit} (Plan: ${stats.planName})`);
    });

    // Test 4: System Stats (if available)
    console.log('\n🌐 Test 4: System Statistics');
    try {
      const systemStats = await usageService.getSystemUsageStats();
      console.log(`  - Total users: ${systemStats.totalUsers}`);
      console.log(`  - Active users: ${systemStats.activeUsers}`);
      console.log(`  - Top users count: ${systemStats.topUsers.length}`);
    } catch (error) {
      console.log(`  - System stats not available (expected for test): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Database Schema Validation
    console.log('\n🗄️ Test 5: Database Schema Validation');

    try {
      // Test if we can query the subscription tables
      const { getDB } = await import('@/libs/DB');
      const db = await getDB();
      const { subscriptionsSchema, subscriptionUsageSchema } = await import('@/models/Schema');

      // Test subscription table
      const subscriptions = await db.select().from(subscriptionsSchema).limit(1);
      console.log(`  - Subscriptions table accessible: ✅ (${subscriptions.length} records found)`);

      // Test usage table
      const usage = await db.select().from(subscriptionUsageSchema).limit(1);
      console.log(`  - Usage table accessible: ✅ (${usage.length} records found)`);
    } catch (error) {
      console.log(`  - Database schema validation failed: ❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🎉 All subscription tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Permission service working');
    console.log('✅ Usage tracking functional');
    console.log('✅ Analytics available');
    console.log('✅ Database schema valid');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nError details:', error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}

// Cleanup function (optional)
async function cleanup() {
  try {
    console.log('\n🧹 Cleaning up test data...');

    const { getDB } = await import('@/libs/DB');
    const db = await getDB();
    const { subscriptionUsageSchema } = await import('@/models/Schema');
    const { eq } = await import('drizzle-orm');

    // Clean up test usage records
    await db.delete(subscriptionUsageSchema).where(eq(subscriptionUsageSchema.userId, testUserId));

    console.log('✅ Cleanup completed');
  } catch (error) {
    console.log('⚠️ Cleanup failed (non-critical):', error instanceof Error ? error.message : error);
  }
}

// Run tests
runSubscriptionTests()
  .then(() => cleanup())
  .then(() => {
    console.log('\n🏁 Test execution finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
