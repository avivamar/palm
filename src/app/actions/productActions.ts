'use server';

import Stripe from 'stripe';

// 检查是否在构建时
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  || process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.STRIPE_SECRET_KEY;

// 只在运行时检查 STRIPE_SECRET_KEY
if (!isBuildTime && !process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured.');
}

// 在构建时或没有 STRIPE_SECRET_KEY 时，创建一个 null stripe 实例
const stripe = !isBuildTime && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil' as any,
    typescript: true,
  })
  : null;

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  color: string;
  priceId: string;
};

// 备用产品数据，使用 COLOR_PRICE_MAP_JSON 配置
function getFallbackProducts(): Product[] {
  try {
    if (!process.env.COLOR_PRICE_MAP_JSON) {
      console.warn('COLOR_PRICE_MAP_JSON is not configured, returning empty products');
      return [];
    }

    const colorPriceMap = JSON.parse(process.env.COLOR_PRICE_MAP_JSON);
    const products: Product[] = [];

    for (const [color, priceId] of Object.entries(colorPriceMap)) {
      products.push({
        id: `rolitt-${color.toLowerCase().replace(/\s+/g, '-')}`,
        name: `Rolitt ${color}`,
        price: 29900, // $299.00 in cents
        currency: 'usd',
        color,
        priceId: priceId as string,
      });
    }

    return products;
  } catch (error) {
    // MODIFICATION: Console error changed to English for production environment visibility
    console.error('Error parsing COLOR_PRICE_MAP_JSON:', error);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    // 在构建时，直接使用备用数据避免Stripe API调用
    if (isBuildTime) {
      console.log('Build time detected, using fallback products from COLOR_PRICE_MAP_JSON');
      return getFallbackProducts();
    }

    // 如果没有配置 STRIPE_PRODUCT_ID 或 stripe 实例不可用，使用备用数据
    if (!process.env.STRIPE_PRODUCT_ID || !stripe) {
      // MODIFICATION: Console warning changed to English for production environment visibility
      console.warn('STRIPE_PRODUCT_ID is not configured or Stripe unavailable, using fallback products from COLOR_PRICE_MAP_JSON');
      return getFallbackProducts();
    }

    const prices = await stripe.prices.list({
      product: process.env.STRIPE_PRODUCT_ID,
      active: true,
      expand: ['data.product'],
    });

    const products = prices.data
      .map((price) => {
        const product = price.product as Stripe.Product;
        const color = price.metadata.color || 'default';

        if (!price.unit_amount) {
          return null;
        }

        return {
          id: `${product.id}-${color}`,
          name: `${product.name} - ${color}`,
          price: price.unit_amount,
          currency: price.currency,
          color,
          priceId: price.id,
        };
      })
      .filter((p): p is Product => p !== null);

    return products.sort((a, b) => a.color.localeCompare(b.color));
  } catch (error) {
    // MODIFICATION: Console error changed to English for production environment visibility
    console.error('Error fetching products from Stripe:', error);
    // 如果 Stripe 调用失败，回退到备用产品数据
    // MODIFICATION: Console log changed to English for production environment visibility
    console.log('Falling back to COLOR_PRICE_MAP_JSON products');
    return getFallbackProducts();
  }
}
