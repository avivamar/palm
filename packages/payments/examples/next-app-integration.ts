/**
 * Next.js App Router 集成示例
 * 展示如何在实际应用中使用多供应商支付系统
 */

// ===== API 路由示例 =====

// app/api/checkout/create-session/route.ts
import { NextRequest } from 'next/server';
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, productId, userId } = await request.json();
    
    // 验证输入
    if (!amount || !currency || !productId || !userId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentService = getPaymentService();
    
    // 获取用户偏好（如果有）
    const userPreference = await getUserPaymentPreference(userId);
    
    // 使用智能路由创建支付会话
    const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
      amount,
      currency,
      customerId: userId,
      description: `Product purchase: ${productId}`,
      metadata: {
        productId,
        userId,
        timestamp: new Date().toISOString(),
      },
    }, {
      preferredProviders: userPreference ? [userPreference] : undefined,
      region: getRegionFromRequest(request),
      paymentMethod: 'card',
    });

    // 记录支付创建事件
    paymentAnalytics.recordEvent({
      provider,
      type: 'payment_created',
      amount,
      currency,
      customerId: userId,
      metadata: { productId },
    });

    return Response.json({
      success: true,
      provider,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Create checkout session failed:', error);
    
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== Webhook 处理示例 =====

// app/api/webhooks/payments/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  
  // 获取 webhook 签名
  const signature = headersList.get('stripe-signature') ||
                   headersList.get('paddle-signature') ||
                   headersList.get('creem-signature') ||
                   headersList.get('braintree-signature');

  if (!signature) {
    console.error('No webhook signature found');
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const paymentService = getPaymentService();
    const startTime = Date.now();
    
    // 验证并解析 webhook
    const event = await paymentService.handleWebhook(body, signature);
    const processingTime = Date.now() - startTime;

    // 记录事件到分析系统
    paymentAnalytics.recordEvent({
      provider: event.provider,
      type: event.type as any,
      amount: event.data.amount,
      currency: event.data.currency,
      customerId: event.data.customerId,
      processingTime,
      metadata: event.data.metadata,
    });

    // 处理不同类型的事件
    switch (event.type) {
      case 'payment_succeeded':
        await handlePaymentSuccess(event.data);
        break;
      
      case 'payment_failed':
        await handlePaymentFailure(event.data);
        break;
      
      case 'subscription_created':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription_canceled':
        await handleSubscriptionCanceled(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// ===== 业务逻辑处理函数 =====

async function handlePaymentSuccess(data: any) {
  const { customerId, amount, currency, metadata } = data;
  
  try {
    // 1. 更新订单状态
    await updateOrderStatus(metadata.productId, 'paid');
    
    // 2. 创建或更新用户账户
    await updateUserAccount(customerId, {
      totalSpent: amount,
      lastPayment: new Date(),
    });
    
    // 3. 发送确认邮件
    await sendPaymentConfirmationEmail(customerId, {
      amount: amount / 100, // 转换为美元
      currency,
      productId: metadata.productId,
    });
    
    // 4. 触发产品交付
    await triggerProductDelivery(metadata.productId, customerId);
    
    console.log(`Payment success processed for customer ${customerId}`);
    
  } catch (error) {
    console.error('Payment success handling failed:', error);
    // 这里应该有重试机制或手动处理队列
  }
}

async function handlePaymentFailure(data: any) {
  const { customerId, amount, currency, errorMessage, metadata } = data;
  
  try {
    // 1. 更新订单状态
    await updateOrderStatus(metadata.productId, 'failed');
    
    // 2. 记录失败原因
    await logPaymentFailure({
      customerId,
      amount,
      currency,
      reason: errorMessage,
      productId: metadata.productId,
      timestamp: new Date(),
    });
    
    // 3. 发送失败通知邮件
    await sendPaymentFailureEmail(customerId, {
      amount: amount / 100,
      currency,
      reason: errorMessage,
      retryUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/${metadata.productId}`,
    });
    
    console.log(`Payment failure processed for customer ${customerId}`);
    
  } catch (error) {
    console.error('Payment failure handling failed:', error);
  }
}

// ===== 工具函数 =====

function getRegionFromRequest(request: NextRequest): string {
  // 从 IP 地址或 headers 获取用户地区
  const country = request.headers.get('cf-ipcountry') || 
                 request.headers.get('x-vercel-ip-country') || 
                 'US';
  
  // 欧洲国家列表
  const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'NO', 'SE', 'DK'];
  
  if (euCountries.includes(country)) {
    return 'EU';
  } else if (country === 'US' || country === 'CA') {
    return 'US';
  } else {
    return 'GLOBAL';
  }
}

async function getUserPaymentPreference(userId: string): Promise<string | null> {
  // 从数据库获取用户偏好
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { preferredPaymentProvider: true },
    });
    
    return user?.preferredPaymentProvider || null;
  } catch (error) {
    console.error('Failed to get user payment preference:', error);
    return null;
  }
}

// ===== 数据库操作示例 =====

async function updateOrderStatus(productId: string, status: string) {
  // 使用你的 ORM (Prisma, Drizzle 等)
  await db.order.update({
    where: { productId },
    data: { 
      status,
      updatedAt: new Date(),
    },
  });
}

async function updateUserAccount(customerId: string, updates: any) {
  await db.user.update({
    where: { id: customerId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });
}

async function logPaymentFailure(failureData: any) {
  await db.paymentFailureLog.create({
    data: failureData,
  });
}

// ===== 邮件发送示例 =====

async function sendPaymentConfirmationEmail(customerId: string, paymentData: any) {
  // 使用你的邮件服务 (SendGrid, Resend 等)
  const user = await db.user.findUnique({ where: { id: customerId } });
  
  if (!user?.email) return;
  
  await emailService.send({
    to: user.email,
    template: 'payment-confirmation',
    data: {
      userName: user.name,
      amount: paymentData.amount,
      currency: paymentData.currency,
      productName: await getProductName(paymentData.productId),
      downloadUrl: await getDownloadUrl(paymentData.productId),
    },
  });
}

async function sendPaymentFailureEmail(customerId: string, failureData: any) {
  const user = await db.user.findUnique({ where: { id: customerId } });
  
  if (!user?.email) return;
  
  await emailService.send({
    to: user.email,
    template: 'payment-failure',
    data: {
      userName: user.name,
      amount: failureData.amount,
      currency: failureData.currency,
      reason: failureData.reason,
      retryUrl: failureData.retryUrl,
    },
  });
}

// ===== 产品交付示例 =====

async function triggerProductDelivery(productId: string, customerId: string) {
  // 根据产品类型触发不同的交付流程
  const product = await db.product.findUnique({ where: { id: productId } });
  
  switch (product?.type) {
    case 'digital':
      await generateDownloadLink(productId, customerId);
      break;
    case 'subscription':
      await activateSubscription(customerId, product.planId);
      break;
    case 'physical':
      await createShippingOrder(customerId, productId);
      break;
    default:
      console.log(`Unknown product type: ${product?.type}`);
  }
}

// ===== 错误处理和重试机制 =====

class PaymentProcessingQueue {
  private static retryAttempts = 3;
  private static retryDelay = 1000; // 1 second

  static async processWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`${context} failed (attempt ${attempt}):`, error);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }
    
    // 所有重试都失败了，记录到失败队列
    await this.addToFailureQueue(context, lastError);
    throw lastError;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static async addToFailureQueue(context: string, error: Error) {
    // 添加到失败队列用于手动处理
    await db.failedTask.create({
      data: {
        context,
        error: error.message,
        stackTrace: error.stack,
        createdAt: new Date(),
        status: 'pending_manual_review',
      },
    });
  }
}

// ===== 监控和分析 =====

// app/api/admin/payment-analytics/route.ts
export async function GET() {
  try {
    const report = paymentAnalytics.generatePerformanceReport();
    const realTimeStats = paymentAnalytics.getRealTimeStats();
    
    return Response.json({
      performanceReport: report,
      realTimeStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

// ===== 健康检查 =====

// app/api/health/payments/route.ts
import { checkPaymentHealth } from '@rolitt/payments';

export async function GET() {
  try {
    const health = await checkPaymentHealth();
    
    const isHealthy = health.configStatus.isValid && 
                     health.providerHealth.every(p => p.status === 'healthy');
    
    return Response.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      ...health,
    }, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: 'Health check failed',
    }, {
      status: 503,
    });
  }
}