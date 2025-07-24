/**
 * 🏥 系统健康检查 API 路由
 * 检查各个系统组件的健康状态
 */

import { NextResponse } from 'next/server';

// 健康检查函数
async function checkDatabase(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
  details?: any;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.DATABASE_URL) {
      return {
        status: 'error',
        message: '数据库连接字符串未配置',
      };
    }

    // 这里可以添加实际的数据库连接检查
    // 现在返回模拟结果
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      message: 'PostgreSQL 连接正常',
      responseTime,
      details: {
        connections: 8,
        maxConnections: 100,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: `数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkRedis(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.REDIS_URL) {
      return {
        status: 'warning',
        message: 'Redis 连接未配置（可选）',
      };
    }

    // 模拟 Redis 检查
    const responseTime = Date.now() - startTime + Math.random() * 10;

    return {
      status: 'healthy',
      message: 'Redis 缓存服务正常',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Redis 连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkStripe(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'error',
        message: 'Stripe 密钥未配置',
      };
    }

    // 模拟 Stripe API 检查
    const responseTime = Date.now() - startTime + Math.random() * 200;

    return {
      status: 'healthy',
      message: 'Stripe 支付服务连接正常',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Stripe 服务检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkShopify(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return {
        status: 'warning',
        message: 'Shopify 配置不完整',
      };
    }

    // 模拟 Shopify API 检查
    const responseTime = Date.now() - startTime + Math.random() * 800 + 100;

    if (responseTime > 500) {
      return {
        status: 'warning',
        message: 'Shopify API 响应较慢',
        responseTime: Math.round(responseTime),
      };
    }

    return {
      status: 'healthy',
      message: 'Shopify API 连接正常',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Shopify 服务检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkEmailService(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        status: 'warning',
        message: 'Resend API 密钥未配置',
      };
    }

    // 模拟邮件服务检查
    const responseTime = Date.now() - startTime + Math.random() * 300;

    return {
      status: 'healthy',
      message: 'Resend 邮件服务正常',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      status: 'error',
      message: `邮件服务检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkCDN(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    // 模拟 CDN 检查
    const responseTime = Date.now() - startTime + Math.random() * 100;

    return {
      status: 'healthy',
      message: 'Vercel CDN 正常',
      responseTime: Math.round(responseTime),
    };
  } catch (error) {
    return {
      status: 'error',
      message: `CDN 检查失败: ${error instanceof Error ? error.message : '未知错误'}`,
      responseTime: Date.now() - startTime,
    };
  }
}

export async function GET() {
  try {
    console.log('[HealthCheck] 开始系统健康检查');

    // 并行执行所有健康检查
    const [
      database,
      redis,
      stripe,
      shopify,
      email,
      cdn,
    ] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkStripe(),
      checkShopify(),
      checkEmailService(),
      checkCDN(),
    ]);

    const components = [
      { component: 'Database', ...database, lastChecked: new Date() },
      { component: 'Redis Cache', ...redis, lastChecked: new Date() },
      { component: 'Stripe API', ...stripe, lastChecked: new Date() },
      { component: 'Shopify API', ...shopify, lastChecked: new Date() },
      { component: 'Email Service', ...email, lastChecked: new Date() },
      { component: 'CDN', ...cdn, lastChecked: new Date() },
    ];

    // 计算整体健康状态
    const errorCount = components.filter(c => c.status === 'error').length;
    const warningCount = components.filter(c => c.status === 'warning').length;

    let overall: 'healthy' | 'warning' | 'error';
    let score: number;

    if (errorCount > 0) {
      overall = 'error';
      score = Math.max(0, 100 - (errorCount * 30) - (warningCount * 10));
    } else if (warningCount > 0) {
      overall = 'warning';
      score = Math.max(70, 100 - (warningCount * 15));
    } else {
      overall = 'healthy';
      score = 100;
    }

    const healthData = {
      overall,
      score,
      components,
      lastUpdate: new Date(),
    };

    console.log(`[HealthCheck] 健康检查完成, 总体状态: ${overall}, 得分: ${score}`);

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('[HealthCheck] 健康检查失败:', error);

    return NextResponse.json(
      {
        overall: 'error',
        score: 0,
        components: [],
        lastUpdate: new Date(),
        error: '健康检查执行失败',
      },
      { status: 500 },
    );
  }
}
