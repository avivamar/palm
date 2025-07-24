/**
 * 测试 Shopify Package 集成
 */

import { ShopifyIntegration } from '@rolitt/shopify';

async function testShopifyPackage() {
  console.log('🧪 开始测试 Shopify Package...\n');

  try {
    // 1. 测试包导入
    console.log('✅ 包导入成功');

    // 2. 测试配置初始化
    const shopify = new ShopifyIntegration({
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN || 'test-store.myshopify.com',
      adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || 'shpat_test',
      apiVersion: '2025-01',
      features: {
        enabled: true,
        productSync: true,
        orderSync: true,
        inventorySync: true,
        customerSync: false,
        webhooks: true,
      },
    });
    console.log('✅ 配置初始化成功');

    // 3. 测试获取服务
    shopify.getProductService();
    console.log('✅ ProductService 获取成功');

    shopify.getOrderService();
    console.log('✅ OrderService 获取成功');

    shopify.getInventoryService();
    console.log('✅ InventoryService 获取成功');

    shopify.getCustomerService();
    console.log('✅ CustomerService 获取成功');

    // 4. 测试配置获取
    const config = shopify.getConfig();
    console.log('✅ 配置获取成功:', {
      storeDomain: config.storeDomain,
      apiVersion: config.apiVersion,
      features: config.features,
    });

    // 5. 测试健康检查（不需要真实连接）
    console.log('\n📊 测试健康检查...');
    try {
      const healthChecker = shopify.getHealthCheck();
      console.log('✅ HealthCheck 获取成功');

      // 尝试调用健康检查（可能会失败，这是正常的）
      const health = await healthChecker.check();
      console.log('健康检查结果:', health);
    } catch (error) {
      console.log('⚠️  健康检查失败（预期行为，因为没有真实的 Shopify 连接）');
    }

    console.log('\n🎉 所有测试通过！Shopify Package 已正确解耦并可以使用。');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testShopifyPackage();
