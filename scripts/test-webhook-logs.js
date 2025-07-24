#!/usr/bin/env node

/**
 * Webhook 日志系统测试脚本
 * 用于验证 webhook 日志 API 的功能
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.WEBHOOK_LOGS_API_KEY;

// 测试数据
const testLogs = [
  {
    event: 'checkout.session.completed',
    status: 'success',
    email: 'test1@example.com',
    metadata: {
      preorder_id: 'pre_test_001',
      session_id: 'cs_test_001',
      amount: 99.99,
      currency: 'usd',
      color: 'khaki',
      locale: 'zh-HK',
      klaviyo_event_sent: true,
    },
  },
  {
    event: 'payment_intent.succeeded',
    status: 'failed',
    email: 'test2@example.com',
    error: 'Klaviyo API rate limit exceeded',
    metadata: {
      preorder_id: 'pre_test_002',
      payment_intent_id: 'pi_test_002',
      amount: 149.99,
      currency: 'usd',
      color: 'black',
      locale: 'en-US',
      klaviyo_event_sent: false,
    },
  },
  {
    event: 'checkout.session.completed',
    status: 'processing',
    email: 'test3@example.com',
    metadata: {
      preorder_id: 'pre_test_003',
      session_id: 'cs_test_003',
      amount: 199.99,
      currency: 'usd',
      color: 'khaki',
      locale: 'zh-CN',
    },
  },
];

// HTTP 请求辅助函数
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'x-api-key': API_KEY }),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`请求失败 (${url}):`, error.message);
    throw error;
  }
}

// 创建测试日志
async function createTestLogs() {
  console.log('\n📝 创建测试日志...');

  const createdLogs = [];

  for (const [index, logData] of testLogs.entries()) {
    try {
      const result = await makeRequest(`${API_BASE_URL}/api/webhook/logs`, {
        method: 'POST',
        body: JSON.stringify(logData),
      });

      console.log(`✅ 日志 ${index + 1} 创建成功: ${result.id}`);
      createdLogs.push(result.id);
    } catch (error) {
      console.error(`❌ 日志 ${index + 1} 创建失败:`, error.message);
    }
  }

  return createdLogs;
}

// 获取日志列表
async function fetchLogs(params = {}) {
  console.log('\n📋 获取日志列表...');

  const queryParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}/api/webhook/logs?${queryParams}`;

  try {
    const data = await makeRequest(url);
    console.log(`✅ 获取到 ${data.logs.length} 条日志`);

    // 显示日志摘要
    data.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.event} - ${log.status} - ${log.email || 'N/A'}`);
    });

    return data;
  } catch (error) {
    console.error('❌ 获取日志失败:', error.message);
    throw error;
  }
}

// 测试状态过滤
async function testStatusFilter() {
  console.log('\n🔍 测试状态过滤...');

  const statuses = ['success', 'failed', 'processing'];

  for (const status of statuses) {
    try {
      const data = await fetchLogs({ status });
      console.log(`✅ ${status} 状态过滤: ${data.logs.length} 条记录`);
    } catch (error) {
      console.error(`❌ ${status} 状态过滤失败:`, error.message);
    }
  }
}

// 测试分页
async function testPagination() {
  console.log('\n📄 测试分页功能...');

  try {
    const page1 = await fetchLogs({ limit: 2, offset: 0 });
    console.log(`✅ 第一页: ${page1.logs.length} 条记录`);

    const page2 = await fetchLogs({ limit: 2, offset: 2 });
    console.log(`✅ 第二页: ${page2.logs.length} 条记录`);
  } catch (error) {
    console.error('❌ 分页测试失败:', error.message);
  }
}

// 清理测试数据（如果有 API Key）
async function cleanupTestData() {
  if (!API_KEY) {
    console.log('\n⚠️  跳过清理（未提供 API Key）');
    return;
  }

  console.log('\n🧹 清理测试数据...');

  try {
    const result = await makeRequest(`${API_BASE_URL}/api/webhook/logs?days=0`, {
      method: 'DELETE',
    });

    console.log(`✅ 清理完成: 删除了 ${result.deletedCount} 条记录`);
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始 Webhook 日志系统测试');
  console.log(`📍 API 地址: ${API_BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY ? '已配置' : '未配置'}`);

  try {
    // 1. 创建测试日志
    const createdLogs = await createTestLogs();

    // 2. 获取所有日志
    await fetchLogs();

    // 3. 测试状态过滤
    await testStatusFilter();

    // 4. 测试分页
    await testPagination();

    // 5. 清理测试数据（可选）
    if (process.argv.includes('--cleanup')) {
      await cleanupTestData();
    }

    console.log('\n✅ 所有测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 显示使用说明
function showUsage() {
  console.log(`
使用方法:
  node ${process.argv[1]} [选项]

选项:
  --cleanup    测试完成后清理测试数据
  --help       显示此帮助信息

环境变量:
  API_BASE_URL           API 基础地址 (默认: http://localhost:3000)
  WEBHOOK_LOGS_API_KEY   API 访问密钥 (可选)

示例:
  # 基本测试
  node ${process.argv[1]}
  
  # 测试并清理数据
  node ${process.argv[1]} --cleanup
  
  # 使用自定义 API 地址
  API_BASE_URL=https://your-domain.com node ${process.argv[1]}
`);
}

// 检查命令行参数
if (process.argv.includes('--help')) {
  showUsage();
  process.exit(0);
}

// 运行测试
if (require.main === module) {
  runTests().catch((error) => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  createTestLogs,
  fetchLogs,
  testStatusFilter,
  testPagination,
  cleanupTestData,
};
