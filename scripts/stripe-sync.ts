#!/usr/bin/env node

/**
 * Stripe 产品同步脚本
 *
 * 功能：
 * 1. 检查现有的 Stripe 产品
 * 2. 自动创建/* Thepalmistrylife 产品和价格
 * 3. 生成环境变量配置
 * 4. 验证产品配置完整性
 *
 * 使用方法：
 * npm run stripe:sync
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { config } from 'dotenv';
import Stripe from 'stripe';

// 加载环境变量
config({ path: '.env.local' });

// Stripe 实例
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil' as any,
});

// 产品颜色配置
const ROLITT_COLORS = [
  'Honey Khaki',
  'Sakura Pink',
  'Healing Green',
  'Moonlight Grey',
  'Red',
] as const;

// 产品价格（美分）
const PRODUCT_PRICE = 29900; // $299.00

type ProductConfig = {
  productId: string;
  prices: Record<string, string>;
};

class StripeProductSync {
  /**
   * 主同步函数
   */
  async sync(): Promise<void> {
    console.log('🚀 开始 Stripe 产品同步...');

    try {
      // 1. 检查现有产品
      const existingProduct = await this.findRolittProduct();

      // 2. 创建或更新产品
      const product = existingProduct || await this.createRolittProduct();

      // 3. 确保所有颜色的价格存在
      const prices = await this.ensureAllPrices(product.id);

      // 4. 生成配置
      const config: ProductConfig = {
        productId: product.id,
        prices,
      };

      // 5. 更新环境变量
      await this.updateEnvironmentVariables(config);

      // 6. 验证配置
      await this.validateConfiguration(config);

      console.log('✅ Stripe 产品同步完成！');
      this.printSummary(config);
    } catch (error) {
      console.error('❌ 同步失败:', error);
      process.exit(1);
    }
  }

  /**
   * 查找现有的/* Thepalmistrylife 产品
   */
  async findRolittProduct(): Promise<Stripe.Product | null> {
    console.log('🔍 查找现有/* Thepalmistrylife 产品...');

    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    const rolittProduct = products.data.find(p =>
      p.name.toLowerCase().includes('rolitt'),
    );

    if (rolittProduct) {
      console.log(`✅ 找到现有产品: ${rolittProduct.name} (${rolittProduct.id})`);
      return rolittProduct;
    }

    console.log('ℹ️  未找到现有/* Thepalmistrylife 产品，将创建新产品');
    return null;
  }

  /**
   * 创建/* Thepalmistrylife 产品
   */
  async createRolittProduct(): Promise<Stripe.Product> {
    console.log('📦 创建/* Thepalmistrylife 产品...');

    const product = await stripe.products.create({
      name: 'Rolitt AI Companion',
      description: 'AI-powered plush companion that redefines emotional connection',
      images: [
        'https://rolitt.com/assets/images/product/rolitt-hero.jpg',
      ],
      metadata: {
        category: 'ai-companion',
        type: 'physical',
        created_by: 'stripe-sync-script',
        sync_version: '1.0',
      },
      active: true,
    });

    console.log(`✅ 产品创建成功: ${product.name} (${product.id})`);
    return product;
  }

  /**
   * 确保所有颜色的价格存在
   */
  async ensureAllPrices(productId: string): Promise<Record<string, string>> {
    console.log('💰 检查价格配置...');

    // 获取现有价格
    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    const priceMap: Record<string, string> = {};
    const existingColors = new Set<string>();

    // 记录现有价格
    for (const price of existingPrices.data) {
      const color = price.metadata.color;
      if (color && ROLITT_COLORS.includes(color as any)) {
        priceMap[color] = price.id;
        existingColors.add(color);
        console.log(`✅ 现有价格: ${color} - ${price.id}`);
      }
    }

    // 创建缺失的价格
    for (const color of ROLITT_COLORS) {
      if (!existingColors.has(color)) {
        console.log(`📝 创建价格: ${color}...`);

        const price = await stripe.prices.create({
          product: productId,
          unit_amount: PRODUCT_PRICE,
          currency: 'usd',
          metadata: {
            color,
            created_by: 'stripe-sync-script',
            sync_version: '1.0',
          },
          nickname: `Rolitt ${color}`,
        });

        priceMap[color] = price.id;
        console.log(`✅ 价格创建成功: ${color} - ${price.id}`);
      }
    }

    return priceMap;
  }

  /**
   * 更新环境变量
   */
  async updateEnvironmentVariables(config: ProductConfig): Promise<void> {
    console.log('⚙️  更新环境变量...');

    const envPath = '.env.local';
    let envContent = '';

    // 读取现有环境变量
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }

    // 更新或添加 STRIPE_PRODUCT_ID
    const productIdRegex = /^STRIPE_PRODUCT_ID=.*$/m;
    const productIdLine = `STRIPE_PRODUCT_ID="${config.productId}"`;

    if (productIdRegex.test(envContent)) {
      envContent = envContent.replace(productIdRegex, productIdLine);
      console.log('✅ 更新 STRIPE_PRODUCT_ID');
    } else {
      envContent += `\n${productIdLine}\n`;
      console.log('✅ 添加 STRIPE_PRODUCT_ID');
    }

    // 更新或添加 COLOR_PRICE_MAP_JSON
    const colorMapRegex = /^COLOR_PRICE_MAP_JSON=.*$/m;
    const colorMapJson = JSON.stringify(config.prices);
    const colorMapLine = `COLOR_PRICE_MAP_JSON='${colorMapJson}'`;

    if (colorMapRegex.test(envContent)) {
      envContent = envContent.replace(colorMapRegex, colorMapLine);
      console.log('✅ 更新 COLOR_PRICE_MAP_JSON');
    } else {
      envContent += `${colorMapLine}\n`;
      console.log('✅ 添加 COLOR_PRICE_MAP_JSON');
    }

    // 写入文件
    writeFileSync(envPath, envContent);
    console.log(`✅ 环境变量已保存到 ${envPath}`);
  }

  /**
   * 验证配置
   */
  async validateConfiguration(config: ProductConfig): Promise<void> {
    console.log('🔍 验证配置...');

    // 验证产品存在
    const product = await stripe.products.retrieve(config.productId);
    console.log(`✅ 产品验证成功: ${product.name}`);

    // 验证所有价格
    for (const [color, priceId] of Object.entries(config.prices)) {
      const price = await stripe.prices.retrieve(priceId);
      console.log(`✅ 价格验证成功: ${color} - $${(price.unit_amount! / 100).toFixed(2)}`);
    }

    // 验证颜色完整性
    const missingColors = ROLITT_COLORS.filter(color => !config.prices[color]);
    if (missingColors.length > 0) {
      throw new Error(`缺失颜色配置: ${missingColors.join(', ')}`);
    }

    console.log('✅ 配置验证通过');
  }

  /**
   * 打印配置摘要
   */
  printSummary(config: ProductConfig): void {
    console.log('\n📋 配置摘要:');
    console.log(`产品 ID: ${config.productId}`);
    console.log('颜色价格映射:');

    for (const [color, priceId] of Object.entries(config.prices)) {
      console.log(`  ${color}: ${priceId}`);
    }

    console.log('\n🎯 下一步操作:');
    console.log('1. 重启开发服务器');
    console.log('2. 验证产品页面显示正确');
    console.log('3. 测试完整的购买流程');
    console.log('4. 部署到生产环境');
  }
}

// 主程序
async function main() {
  const sync = new StripeProductSync();
  await sync.sync();
}

// 错误处理
process.on('unhandledRejection', (reason, _promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

export default StripeProductSync;
