#!/usr/bin/env node

/**
 * Verify Webhook and Payment Fixes
 * 验证 Webhook 和支付修复是否正常工作
 */

const http = require('node:http');
const https = require('node:https');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rolitt.com';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    const req = protocol.request(url, {
      method: 'GET',
      timeout: 10000,
      ...options,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 Testing ${name}...`);
    const response = await makeRequest(url);

    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: OK (${response.status})`);
      return true;
    } else {
      console.log(`❌ ${name}: Failed (${response.status})`);
      console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
      if (response.data && response.data.length < 500) {
        console.log(`   Response: ${response.data}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoint() {
  const url = `${BASE_URL}/api/webhooks/stripe`;

  try {
    console.log(`🔍 Testing Webhook Endpoint (GET)...`);
    const response = await makeRequest(url);

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.data);
        if (data.message && data.status === 'active') {
          console.log(`✅ Webhook Endpoint: OK - ${data.message}`);
          return true;
        }
      } catch (e) {
        // Response might not be JSON
      }
      console.log(`✅ Webhook Endpoint: Accessible (${response.status})`);
      return true;
    } else {
      console.log(`❌ Webhook Endpoint: Failed (${response.status})`);
      if (response.data && response.data.length < 500) {
        console.log(`   Response: ${response.data}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ Webhook Endpoint: Error - ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('🚀 开始验证 Webhook 和支付修复...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check Endpoint',
      test: () => testEndpoint('Health Check', `${BASE_URL}/api/webhook/health`),
    },
    {
      name: 'Webhook Endpoint (Stripe)',
      test: testWebhookEndpoint,
    },
    {
      name: 'Products API',
      test: () => testEndpoint('Products API', `${BASE_URL}/api/products`),
    },
    {
      name: 'Debug Payment Page',
      test: () => testEndpoint('Debug Payment Page', `${BASE_URL}/debug-payment`),
    },
    {
      name: 'Pre-order Page',
      test: () => testEndpoint('Pre-order Page', `${BASE_URL}/pre-order`),
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Add spacing
  }

  console.log('📊 验证结果:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 所有测试通过！修复成功。');
    process.exit(0);
  } else {
    console.log('\n⚠️  存在失败的测试，请检查相关配置。');
    process.exit(1);
  }
}

// 环境变量检查
function checkCriticalEnvVars() {
  const critical = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const missing = critical.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.log('❌ 缺少关键环境变量:');
    missing.forEach(env => console.log(`   - ${env}`));
    console.log('\n请先配置环境变量再运行验证。');
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
Webhook 和支付修复验证工具

用法:
  npm run verify-fixes                    # 运行验证测试
  node scripts/verify-fixes.js --help    # 显示帮助

环境变量:
  NEXT_PUBLIC_APP_URL                     # 应用的基础URL (必需)

测试内容:
  - Health Check API 可访问性
  - Stripe Webhook 端点状态
  - Products API 响应
  - Debug Payment 页面
  - Pre-order 页面

注意:
  - 此脚本会对生产环境进行 GET 请求测试
  - 不会执行实际的支付操作
  - 仅验证端点的可访问性和基本响应
`);
}

// 主程序
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else {
  checkCriticalEnvVars();
  runVerification().catch((error) => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}
