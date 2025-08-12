#!/usr/bin/env node

/**
 * 简化的 Stripe 产品检查脚本
 * 用于快速检查和配置 Stripe 产品
 */

const { config } = require('dotenv');

// 加载环境变量
config({ path: '.env.local' });

async function checkStripeConfig() {
  console.log('🔍 检查 Stripe 配置...\n');

  // 检查必需的环境变量
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ];

  const optionalVars = [
    'STRIPE_PRODUCT_ID',
    'COLOR_PRICE_MAP_JSON',
    'STRIPE_WEBHOOK_SECRET',
  ];

  console.log('📋 必需配置:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: 未配置`);
    }
  }

  console.log('\n📋 可选配置:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      if (varName === 'COLOR_PRICE_MAP_JSON') {
        try {
          const parsed = JSON.parse(value);
          console.log(`✅ ${varName}: ${Object.keys(parsed).length} 个颜色配置`);
        } catch {
          console.log(`⚠️  ${varName}: JSON 格式错误`);
        }
      } else {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      }
    } else {
      console.log(`⚠️  ${varName}: 未配置 (将使用备用模式)`);
    }
  }

  // 检查 Stripe 连接
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil',
      });

      console.log('\n🔗 测试 Stripe 连接...');
      const account = await stripe.accounts.retrieve();
      console.log(`✅ Stripe 连接成功: ${account.display_name || account.id}`);

      // 检查产品
      if (process.env.STRIPE_PRODUCT_ID) {
        console.log('\n📦 检查产品配置...');
        try {
          const product = await stripe.products.retrieve(process.env.STRIPE_PRODUCT_ID);
          console.log(`✅ 产品存在: ${product.name}`);

          const prices = await stripe.prices.list({
            product: process.env.STRIPE_PRODUCT_ID,
            active: true,
          });
          console.log(`✅ 找到 ${prices.data.length} 个价格`);

          for (const price of prices.data) {
            const color = price.metadata.color || 'default';
            const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
            console.log(`   - ${color}: ${amount} (${price.id})`);
          }
        } catch (error) {
          console.log(`❌ 产品检查失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Stripe 连接失败: ${error.message}`);
    }
  }

  console.log('\n🎯 建议操作:');

  if (!process.env.STRIPE_PRODUCT_ID) {
    console.log('1. 运行 npm run stripe:sync 创建和配置产品');
  } else {
    console.log('1. ✅ Stripe 产品已配置');
  }

  if (!process.env.COLOR_PRICE_MAP_JSON) {
    console.log('2. 配置 COLOR_PRICE_MAP_JSON 作为备用方案');
  } else {
    console.log('2. ✅ 备用价格配置已设置');
  }

  console.log('3. 运行 npm run dev 测试产品页面');
  console.log('4. 测试完整的购买流程');
}

checkStripeConfig().catch(console.error);
