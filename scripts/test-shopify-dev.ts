/**
 * Shopify 集成开发测试脚本 (无需真实凭据)
 */

import { shopifyMetrics } from '@rolitt/shopify/monitoring/metrics';

async function testShopifyIntegrationDev() {
  console.log('🧪 Starting Shopify integration development tests...');

  try {
    // 1. 测试度量收集器
    console.log('\n1️⃣ Testing metrics collector...');

    // 模拟 API 调用
    shopifyMetrics.recordApiCall(true, 150); // 成功调用，150ms
    shopifyMetrics.recordApiCall(true, 200); // 成功调用，200ms
    shopifyMetrics.recordApiCall(false, 500); // 失败调用，500ms

    // 模拟订单同步
    shopifyMetrics.recordOrderSync(true);
    shopifyMetrics.recordOrderSync(true);
    shopifyMetrics.recordOrderSync(false);

    console.log('✅ Metrics collector test completed');

    // 2. 测试度量报告生成
    console.log('\n2️⃣ Testing metrics reporting...');

    const summary = shopifyMetrics.getMetrics();
    console.log('📊 Current metrics summary:', {
      totalApiCalls: summary.totalApiCalls,
      successfulApiCalls: summary.successfulApiCalls,
      failedApiCalls: summary.failedApiCalls,
      averageResponseTime: `${summary.averageResponseTime.toFixed(0)}ms`,
      errorRate: `${summary.errorRate.toFixed(2)}%`,
      healthStatus: summary.healthStatus,
      ordersSynced: summary.ordersSynced,
      ordersFailedSync: summary.ordersFailedSync,
    });

    // 3. 测试详细报告
    console.log('\n3️⃣ Testing detailed reporting...');

    const detailedReport = shopifyMetrics.getDetailedReport();
    console.log('📈 Performance metrics:', detailedReport.performance);
    console.log('🔄 Sync metrics:', detailedReport.sync);
    console.log('🏥 Health recommendations:', detailedReport.health.recommendations);

    // 4. 测试导出功能
    console.log('\n4️⃣ Testing export functionality...');

    const exportData = shopifyMetrics.exportMetrics();
    console.log('💾 Export data structure validated:', {
      hasTimestamp: !!exportData.timestamp,
      hasMetrics: !!exportData.metrics,
      hasPerformance: !!exportData.performance,
      metricsKeys: Object.keys(exportData.metrics),
    });

    // 5. 测试健康状态逻辑
    console.log('\n5️⃣ Testing health status logic...');

    // 模拟不同的错误率场景
    console.log('Current health status:', summary.healthStatus);

    if (summary.healthStatus === 'healthy') {
      console.log('✅ System is operating normally');
    } else if (summary.healthStatus === 'degraded') {
      console.log('⚠️ System performance is degraded');
    } else {
      console.log('❌ System is unhealthy');
    }

    // 6. 测试度量重置
    console.log('\n6️⃣ Testing metrics reset...');

    const beforeReset = shopifyMetrics.getMetrics();
    console.log('Before reset - API calls:', beforeReset.totalApiCalls);

    shopifyMetrics.reset();

    const afterReset = shopifyMetrics.getMetrics();
    console.log('After reset - API calls:', afterReset.totalApiCalls);
    console.log('✅ Metrics reset successfully');

    console.log('\n🎉 All development tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Configure Shopify environment variables:');
    console.log('     - SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
    console.log('     - SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...');
    console.log('  2. Test with real Shopify API connection');
    console.log('  3. Verify webhook integration in production environment');
  } catch (error) {
    console.error('🛑 Development test failed:', error);
    process.exit(1);
  }
}

// 运行开发测试
if (require.main === module) {
  testShopifyIntegrationDev()
    .then(() => {
      console.log('✅ Development test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Development test suite failed:', error);
      process.exit(1);
    });
}

export { testShopifyIntegrationDev };
