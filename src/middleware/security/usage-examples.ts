/**
 * 安全中间件使用示例
 * 展示如何在不同类型的 API 路由中应用安全措施
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createRateLimiter } from './rate-limiter';
import { unifiedSecurityMiddleware } from './unified-security';

/**
 * 示例1: 保护管理员 API 路由
 * 文件: src/app/api/admin/users/route.ts
 */
export async function protectedAdminRoute(request: NextRequest) {
  const securityResult = await unifiedSecurityMiddleware(request);
  if (securityResult) {
    return securityResult;
  }

  // 原有的 API 逻辑
  try {
    // 验证管理员权限
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 执行管理员操作
    const result = await performAdminOperation();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Admin API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * 示例2: 保护支付 API 路由
 * 文件: src/app/api/payment/stripe/route.ts
 */
export async function protectedPaymentRoute(request: NextRequest) {
  const securityResult = await unifiedSecurityMiddleware(request);
  if (securityResult) {
    return securityResult;
  }

  try {
    // 验证支付权限
    const authResult = await verifyPaymentAuth(request);
    if (!authResult.success) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 额外的支付安全检查
    const securityCheck = await performPaymentSecurityCheck(request);
    if (!securityCheck.passed) {
      return new NextResponse('Payment security check failed', { status: 403 });
    }

    // 执行支付操作
    const result = await processPayment(request);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Payment API error:', error);
    return new NextResponse('Payment processing failed', { status: 500 });
  }
}

/**
 * 示例3: 保护认证 API 路由
 * 文件: src/app/api/auth/login/route.ts
 */
export async function protectedAuthRoute(request: NextRequest) {
  const securityResult = await unifiedSecurityMiddleware(request);
  if (securityResult) {
    return securityResult;
  }

  try {
    // 解析登录请求
    const loginData = await request.json();

    // 验证输入数据
    const validation = validateLoginInput(loginData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 },
      );
    }

    // 执行登录逻辑
    const authResult = await authenticateUser(loginData);

    if (!authResult.success) {
      // 记录失败的登录尝试
      await logFailedLogin(request, loginData.email);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      token: authResult.token,
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return new NextResponse('Authentication error', { status: 500 });
  }
}

/**
 * 示例4: 使用自定义速率限制
 * 文件: src/app/api/contact/route.ts
 */
export async function contactFormRoute(request: NextRequest) {
  // 使用严格的速率限制（每小时只能提交5次）
  const strictRateLimit = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 5, // 5个请求
    message: 'Too many form submissions, please try again later.',
  });

  return strictRateLimit(request, async () => {
    try {
      const formData = await request.json();

      // 验证表单数据
      const validation = validateContactForm(formData);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid form data' },
          { status: 400 },
        );
      }

      // 垃圾邮件检测
      const spamCheck = await checkForSpam(formData);
      if (spamCheck.isSpam) {
        return NextResponse.json(
          { error: 'Spam detected' },
          { status: 403 },
        );
      }

      // 发送联系表单
      await sendContactForm(formData);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Contact form error:', error);
      return new NextResponse('Form submission failed', { status: 500 });
    }
  });
}

/**
 * 示例5: Webhook 路由保护
 * 文件: src/app/api/webhook/stripe/route.ts
 */
export async function protectedWebhookRoute(request: NextRequest) {
  const securityResult = await unifiedSecurityMiddleware(request);
  if (securityResult) {
    return securityResult;
  }

  try {
    // 验证 Webhook 签名
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return new NextResponse('Missing signature', { status: 400 });
    }

    const body = await request.text();
    const isValidSignature = await verifyStripeSignature(body, signature);

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // 处理 Webhook 事件
    const event = JSON.parse(body);
    await processStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}

// 辅助函数示例（这些需要根据实际需求实现）

async function verifyAdminAuth(request: NextRequest): Promise<{ success: boolean; user?: any }> {
  // 实现管理员认证逻辑
  const token = request.headers.get('authorization');

  // 简单的 token 验证示例
  if (!token || !token.startsWith('Bearer ')) {
    return { success: false };
  }

  // 这里应该实现实际的 token 验证逻辑
  // 例如：验证 JWT token，检查数据库等

  return { success: true };
}

async function performAdminOperation(): Promise<any> {
  // 实现管理员操作
  return {};
}

async function verifyPaymentAuth(_request: NextRequest): Promise<{ success: boolean }> {
  // 实现支付认证逻辑
  return { success: true };
}

async function performPaymentSecurityCheck(_request: NextRequest): Promise<{ passed: boolean }> {
  // 实现支付安全检查
  return { passed: true };
}

async function processPayment(_request: NextRequest): Promise<any> {
  // 实现支付处理逻辑
  return {};
}

function validateLoginInput(data: any): { success: boolean; error?: string } {
  // 实现输入验证
  if (!data.email || !data.password) {
    return { success: false, error: 'Email and password are required' };
  }
  return { success: true };
}

async function authenticateUser(_loginData: any): Promise<{ success: boolean; token?: string }> {
  // 实现用户认证
  return { success: true, token: 'jwt-token' };
}

async function logFailedLogin(request: NextRequest, email: string): Promise<void> {
  // 记录失败的登录尝试
  console.warn('Failed login attempt:', { email, ip: request.headers.get('x-forwarded-for') });
}

function validateContactForm(_data: any): { success: boolean; error?: string } {
  // 实现联系表单验证
  return { success: true };
}

async function checkForSpam(_data: any): Promise<{ isSpam: boolean }> {
  // 实现垃圾邮件检测
  return { isSpam: false };
}

async function sendContactForm(_data: any): Promise<void> {
  // 发送联系表单
}

async function verifyStripeSignature(_body: string, _signature: string): Promise<boolean> {
  // 验证 Stripe Webhook 签名
  return true;
}

async function processStripeWebhook(_event: any): Promise<void> {
  // 处理 Stripe Webhook 事件
}
