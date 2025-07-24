/**
 * Shopify 集成测试脚本
 */

import { ShopifyClient, WebhookService } from '@rolitt/shopify';

async function testShopifyIntegration() {
  console.log('🧪 Starting Shopify integration tests...');

  try {
    // 1. 测试客户端初始化
    console.log('\n1️⃣ Testing client initialization...');
    const shopifyClient = new ShopifyClient();
    console.log('✅ Shopify client initialized successfully');

    // 2. 测试健康检查
    console.log('\n2️⃣ Testing health check...');
    const healthResult = await shopifyClient.healthCheck();
    console.log('Health check result:', healthResult);

    if (healthResult.status === 'healthy') {
      console.log('✅ Shopify API connection is healthy');
    } else {
      console.log('❌ Shopify API connection failed:', healthResult.error);
      return;
    }

    // 3. 测试 Webhook 服务
    console.log('\n3️⃣ Testing webhook service...');
    const webhookService = new WebhookService(shopifyClient);

    // 模拟 Stripe session 数据
    const mockSession = {
      id: 'cs_test_123456789',
      customer_details: {
        email: 'test@example.com',
        name: 'Test Customer',
        phone: '+1234567890',
        address: {
          line1: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US',
        },
      },
      amount_total: 9900, // $99.00
      currency: 'usd',
      metadata: {
        color: 'Healing Green',
        preorder_id: 'test_preorder_123',
      },
      payment_intent: 'pi_test_123456789',
      shipping_details: {
        address: {
          line1: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US',
        },
      },
    };

    const mockMetadata = {
      preorderId: 'test_preorder_123',
      email: 'test@example.com',
    };

    console.log('📝 Processing mock Stripe order...');
    const result = await webhookService.processStripeOrder(mockSession, mockMetadata);

    if (result.success) {
      console.log('✅ Mock order processed successfully');
      console.log('Shopify Order ID:', result.shopifyOrderId);
      console.log('Shopify Order Number:', result.shopifyOrderNumber);
    } else {
      console.log('❌ Mock order processing failed:', result.error);
      if (result.retryable) {
        console.log('ℹ️ This error is retryable');
      }
    }

    // 4. 测试批量处理
    console.log('\n4️⃣ Testing batch processing...');
    const batchResult = await webhookService.processBatchOrders([
      { sessionData: mockSession, metadata: mockMetadata },
    ]);

    console.log('Batch processing result:', {
      success: batchResult.success,
      failed: batchResult.failed,
      total: batchResult.success + batchResult.failed,
    });

    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('🛑 Test failed with error:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testShopifyIntegration()
    .then(() => {
      console.log('✅ Test suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { testShopifyIntegration };
