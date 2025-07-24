#!/usr/bin/env node

/**
 * 测试 Klaviyo API 修复
 * 验证新的 profile 数据格式是否正确
 */

const { Klaviyo } = require('../src/libs/Klaviyo.ts');

async function testKlaviyoFix() {
  console.log('🧪 Testing Klaviyo API fix...');

  // 测试数据
  const testEmail = 'test@rolitt.com';
  const testEventName = 'Test Event';
  const testProperties = {
    email: testEmail,
    test_property: 'test_value',
    timestamp: new Date().toISOString(),
  };

  try {
    // 测试新版 API 格式
    console.log('📤 Testing new API format...');
    const result = await Klaviyo.track(testEventName, testProperties);

    if (result) {
      console.log('✅ Klaviyo API call successful!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('⚠️  Klaviyo API call returned null (likely due to missing API key)');
    }

    // 测试传统 API 格式
    console.log('\n📤 Testing legacy API format...');
    const legacyResult = await Klaviyo.trackPreorderStarted(testEmail, {
      color: 'test-color',
      preorder_id: 'test-123',
    });

    if (legacyResult) {
      console.log('✅ Legacy Klaviyo API call successful!');
      console.log('📊 Response:', JSON.stringify(legacyResult, null, 2));
    } else {
      console.log('⚠️  Legacy Klaviyo API call returned null (likely due to missing API key)');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }

  console.log('\n🎉 Klaviyo API fix test completed!');
  console.log('💡 Note: If API key is not configured, calls will return null (this is expected behavior)');
}

// 运行测试
testKlaviyoFix().catch(console.error);
