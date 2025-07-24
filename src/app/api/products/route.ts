import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 超时配置
const TIMEOUT_CONFIG = {
  dataProcessing: 3000, // 3秒 - 数据处理
  validation: 1000, // 1秒 - 数据验证
};

// 超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// 产品数据 - 与数据库Schema中的productColorEnum保持一致
const products = [
  {
    id: 'rolitt-healing-green',
    name: 'Rolitt Healing Green',
    color: 'Healing Green',
    price: 299,
    currency: 'USD',
    description: '治愈绿版本的Rolitt产品',
    image: '/pre-order/green.png',
    available: true,
  },
  {
    id: 'rolitt-moonlight-grey',
    name: 'Rolitt Moonlight Grey',
    color: 'Moonlight Grey',
    price: 299,
    currency: 'USD',
    description: '月光灰版本的Rolitt产品',
    image: '/pre-order/grey.png',
    available: true,
  },
  {
    id: 'rolitt-honey-khaki',
    name: 'Rolitt Honey Khaki',
    color: 'Honey Khaki',
    price: 299,
    currency: 'USD',
    description: '蜂蜜卡其版本的Rolitt产品',
    image: '/pre-order/khaki.png',
    available: true,
  },
  {
    id: 'rolitt-sakura-pink',
    name: 'Rolitt Sakura Pink',
    color: 'Sakura Pink',
    price: 299,
    currency: 'USD',
    description: '樱花粉版本的Rolitt产品',
    image: '/pre-order/pink.png',
    available: true,
  },
];

// GET /api/products - 获取所有产品
export async function GET(request: NextRequest) {
  try {
    // 解析请求参数 (带超时)
    const { searchParams } = await withTimeout(
      Promise.resolve(new URL(request.url)),
      TIMEOUT_CONFIG.validation,
    );
    const id = searchParams.get('id');

    if (id) {
      // 获取特定产品 (带超时)
      const product = await withTimeout(
        Promise.resolve(products.find(p => p.id === id)),
        TIMEOUT_CONFIG.dataProcessing,
      );
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 },
        );
      }
      return NextResponse.json(product);
    }

    // 获取所有产品 (带超时)
    const result = await withTimeout(
      Promise.resolve({
        products,
        total: products.length,
        timestamp: new Date().toISOString(),
      }),
      TIMEOUT_CONFIG.dataProcessing,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Products API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST /api/products - 创建新产品（仅用于测试）
export async function POST(request: NextRequest) {
  try {
    // 解析请求体 (带超时)
    const body = await withTimeout(
      request.json(),
      TIMEOUT_CONFIG.validation,
    );

    // 验证必需字段 (带超时)
    const isValid = await withTimeout(
      Promise.resolve(!!(body.id && body.name && body.price)),
      TIMEOUT_CONFIG.validation,
    );
    if (!isValid) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, price' },
        { status: 400 },
      );
    }

    // 检查产品是否已存在 (带超时)
    const existingProduct = await withTimeout(
      Promise.resolve(products.find(p => p.id === body.id)),
      TIMEOUT_CONFIG.dataProcessing,
    );
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product already exists' },
        { status: 409 },
      );
    }

    // 创建新产品 (带超时)
    const newProduct = await withTimeout(
      Promise.resolve({
        id: body.id,
        name: body.name,
        color: body.color || '',
        price: body.price,
        currency: body.currency || 'USD',
        description: body.description || '',
        image: body.image || '',
        available: body.available !== false,
      }),
      TIMEOUT_CONFIG.dataProcessing,
    );

    products.push(newProduct);

    return NextResponse.json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Product creation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    // 处理验证错误
    if (error instanceof Error && error.name === 'SyntaxError') {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 400 },
    );
  }
}
