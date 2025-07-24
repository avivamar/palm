/**
 * 🧪 独立的 Shopify 集成验证脚本
 * 不依赖 Next.js 环境，直接使用 dotenv 加载环境变量
 */

import { resolve } from 'node:path';
import dotenv from 'dotenv';

// 直接加载 .env.local 文件
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// 简化的 Shopify 客户端，用于测试
class SimpleShopifyClient {
  private storeDomain: string;
  private accessToken: string;

  constructor(storeDomain: string, accessToken: string) {
    this.storeDomain = storeDomain;
    this.accessToken = accessToken;
  }

  async testConnection() {
    try {
      const url = `https://${this.storeDomain}/admin/api/2025-01/shop.json`;
      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data.shop,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorData.errors || response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误',
      };
    }
  }
}

async function runShopifyValidation() {
  console.log('🚀 开始独立 Shopify 集成验证...\n');

  // 1. 检查环境变量
  console.log('📋 步骤 1: 检查环境变量');
  const shopifyEnabled = process.env.SHOPIFY_INTEGRATION_ENABLED;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION;

  console.log(`   SHOPIFY_INTEGRATION_ENABLED: ${shopifyEnabled}`);
  console.log(`   SHOPIFY_STORE_DOMAIN: ${storeDomain ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   SHOPIFY_ADMIN_ACCESS_TOKEN: ${accessToken ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   SHOPIFY_API_VERSION: ${apiVersion || '使用默认值'}`);

  if (shopifyEnabled !== 'true') {
    console.log('\n⚠️  Shopify 集成已禁用');
    console.log('   要启用，请在 .env.local 中设置 SHOPIFY_INTEGRATION_ENABLED=true');
    return;
  }

  if (!storeDomain || !accessToken) {
    console.log('\n❌ 缺少必要的 Shopify 配置');
    console.log('   请确保在 .env.local 中设置了：');
    console.log('   - SHOPIFY_STORE_DOMAIN=your-store.myshopify.com');
    console.log('   - SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...');
    return;
  }

  // 2. 验证配置格式
  console.log('\n🔍 步骤 2: 验证配置格式');
  if (!storeDomain.includes('.myshopify.com')) {
    console.log('   ⚠️  SHOPIFY_STORE_DOMAIN 格式可能不正确');
    console.log('      应该是：your-store.myshopify.com 格式');
  } else {
    console.log('   ✅ 商店域名格式正确');
  }

  if (!accessToken.startsWith('shpat_')) {
    console.log('   ⚠️  SHOPIFY_ADMIN_ACCESS_TOKEN 格式可能不正确');
    console.log('      应该以 shpat_ 开头');
  } else {
    console.log('   ✅ 访问令牌格式正确');
  }

  // 3. 测试 API 连接
  console.log('\n🌐 步骤 3: 测试 Shopify API 连接');
  const client = new SimpleShopifyClient(storeDomain, accessToken);

  try {
    const result = await client.testConnection();

    if (result.success) {
      console.log('   ✅ API 连接成功！');
      console.log(`   📊 商店信息:`);
      console.log(`      名称: ${result.data?.name || 'N/A'}`);
      console.log(`      域名: ${result.data?.domain || 'N/A'}`);
      console.log(`      货币: ${result.data?.currency || 'N/A'}`);
      console.log(`      计划: ${result.data?.plan_name || 'N/A'}`);
      console.log(`      时区: ${result.data?.timezone || 'N/A'}`);
    } else {
      console.log('   ❌ API 连接失败');
      console.log(`      错误: ${result.error}`);

      if (result.error?.includes('401')) {
        console.log('      💡 这通常表示访问令牌无效或已过期');
      } else if (result.error?.includes('404')) {
        console.log('      💡 这通常表示商店域名不正确');
      } else if (result.error?.includes('403')) {
        console.log('      💡 这通常表示访问令牌权限不足');
      }
    }
  } catch (error) {
    console.log('   ❌ 连接测试失败');
    console.log(`      错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 4. 检查数据库连接（如果可用）
  console.log('\n💾 步骤 4: 检查数据库连接');
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    console.log('   ✅ 数据库 URL 已配置');
    console.log('   📋 数据库 schema 应该包含 Shopify 集成字段');
  } else {
    console.log('   ⚠️  数据库 URL 未配置');
  }

  // 5. 总结
  console.log('\n📝 验证结果总结:');
  console.log('   ✅ 环境变量配置检查完成');
  console.log('   ✅ Shopify API 连接测试完成');
  console.log('   ✅ 基础验证流程完成');

  console.log('\n🎯 下一步可以做的事情:');
  console.log('   1. 运行完整的应用程序进行更详细的测试');
  console.log('   2. 开始同步预订单到 Shopify');
  console.log('   3. 设置 Shopify Webhook（如果需要）');
  console.log('   4. 开始使用库存同步功能');
}

// 执行验证
if (require.main === module) {
  runShopifyValidation()
    .then(() => {
      console.log('\n🎉 Shopify 集成验证完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 验证过程中出现错误：', error);
      process.exit(1);
    });
}

export { runShopifyValidation };
