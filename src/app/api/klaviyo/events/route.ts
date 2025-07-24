import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isValidEmail, RolittKlaviyoEvents } from '@/libs/klaviyo-utils';

// 超时配置
const TIMEOUT_CONFIG = {
  requestParsing: 3000, // 3秒 - 请求解析
  klaviyoApi: 10000, // 10秒 - Klaviyo API调用
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

// API Key 验证中间件
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.KLAVIYO_WEBHOOK_SECRET || 'your-secret-key';
  return apiKey === expectedKey;
}

// 请求体验证
type KlaviyoEventRequest = {
  event_type: 'preorder_started' | 'preorder_success' | 'preorder_failed';
  email: string;
  properties: Record<string, any>;
  unique_id?: string;
};

function validateRequestBody(body: any): body is KlaviyoEventRequest {
  return (
    body
    && typeof body.event_type === 'string'
    && ['preorder_started', 'preorder_success', 'preorder_failed'].includes(body.event_type)
    && typeof body.email === 'string'
    && isValidEmail(body.email)
    && typeof body.properties === 'object'
    && body.properties !== null
  );
}

/**
 * POST /api/klaviyo/events
 *
 * 统一的 Klaviyo 事件发送 API endpoint
 * 支持所有 Rolitt 预售相关事件的发送
 *
 * 请求格式:
 * {
 *   "event_type": "preorder_started" | "preorder_success" | "preorder_failed",
 *   "email": "user@example.com",
 *   "properties": {
 *     "color": "khaki",
 *     "preorder_id": "abc123",
 *     // ... 其他属性
 *   },
 *   "unique_id": "optional-unique-identifier"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. API Key 验证
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 },
      );
    }

    // 2. 解析请求体
    let body: any;
    try {
      body = await withTimeout(request.json(), TIMEOUT_CONFIG.requestParsing);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return NextResponse.json(
          { error: 'Request parsing timed out' },
          { status: 408 },
        );
      }
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    // 3. 验证请求体格式
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          required_fields: ['event_type', 'email', 'properties'],
          valid_event_types: ['preorder_started', 'preorder_success', 'preorder_failed'],
        },
        { status: 400 },
      );
    }

    const { event_type, email, properties } = body;

    // 4. 根据事件类型发送到 Klaviyo
    let result;

    switch (event_type) {
      case 'preorder_started':
        // 验证必需字段
        if (!properties.color || !properties.preorder_id) {
          return NextResponse.json(
            {
              error: 'Missing required properties for preorder_started',
              required: ['color', 'preorder_id'],
            },
            { status: 400 },
          );
        }

        result = await withTimeout(
          RolittKlaviyoEvents.preorderStarted(email, {
            color: properties.color,
            preorder_id: properties.preorder_id,
            preorder_number: properties.preorder_number,
            locale: properties.locale,
            source: properties.source,
          }),
          TIMEOUT_CONFIG.klaviyoApi,
        );
        break;

      case 'preorder_success':
        // 验证必需字段
        if (!properties.color || !properties.preorder_id) {
          return NextResponse.json(
            {
              error: 'Missing required properties for preorder_success',
              required: ['color', 'preorder_id'],
            },
            { status: 400 },
          );
        }

        result = await withTimeout(
          RolittKlaviyoEvents.preorderSuccess(email, {
            color: properties.color,
            preorder_id: properties.preorder_id,
            preorder_number: properties.preorder_number,
            locale: properties.locale,
            amount: properties.amount,
            currency: properties.currency,
            payment_intent_id: properties.payment_intent_id,
            session_id: properties.session_id,
          }),
          TIMEOUT_CONFIG.klaviyoApi,
        );
        break;

      case 'preorder_failed':
        // 验证必需字段
        if (!properties.color || !properties.preorder_id) {
          return NextResponse.json(
            {
              error: 'Missing required properties for preorder_failed',
              required: ['color', 'preorder_id'],
            },
            { status: 400 },
          );
        }

        result = await withTimeout(
          RolittKlaviyoEvents.preorderFailed(email, {
            color: properties.color,
            preorder_id: properties.preorder_id,
            error_reason: properties.error_reason,
            locale: properties.locale,
          }),
          TIMEOUT_CONFIG.klaviyoApi,
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported event type: ${event_type}` },
          { status: 400 },
        );
    }

    // 5. 返回结果
    if (result) {
      return NextResponse.json({
        success: true,
        message: `Event ${event_type} sent successfully to Klaviyo`,
        event_type,
        email,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send event ${event_type} to Klaviyo`,
          event_type,
          email,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('[Klaviyo API] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Klaviyo API request timed out. Please try again later.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing the request',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/klaviyo/events
 *
 * 获取 API 使用说明和示例
 */
export async function GET() {
  return NextResponse.json({
    name: 'Rolitt Klaviyo Events API',
    version: '1.0.0',
    description: 'Unified API endpoint for sending Rolitt preorder events to Klaviyo',
    endpoints: {
      'POST /api/klaviyo/events': {
        description: 'Send a Klaviyo event',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'Your API key for authentication',
        },
        body: {
          event_type: 'preorder_started | preorder_success | preorder_failed',
          email: 'user@example.com',
          properties: {
            'color': 'khaki',
            'preorder_id': 'abc123',
            '...': 'other event-specific properties',
          },
          unique_id: 'optional-unique-identifier',
        },
      },
    },
    examples: {
      preorder_started: {
        event_type: 'preorder_started',
        email: 'user@example.com',
        properties: {
          color: 'khaki',
          preorder_id: 'abc123def456',
          locale: 'zh-HK',
          source: 'Stripe Checkout',
        },
      },
      preorder_success: {
        event_type: 'preorder_success',
        email: 'user@example.com',
        properties: {
          color: 'khaki',
          preorder_id: 'abc123def456',
          locale: 'zh-HK',
          amount: 99.00,
          currency: 'usd',
          session_id: 'cs_test_abc123',
          payment_intent_id: 'pi_test_xyz789',
        },
      },
      preorder_failed: {
        event_type: 'preorder_failed',
        email: 'user@example.com',
        properties: {
          color: 'khaki',
          preorder_id: 'abc123def456',
          error_reason: 'Payment declined',
          locale: 'zh-HK',
        },
      },
    },
    supported_properties: {
      common: ['color', 'preorder_id', 'locale'],
      preorder_started: ['preorder_number', 'source'],
      preorder_success: ['preorder_number', 'amount', 'currency', 'session_id', 'payment_intent_id'],
      preorder_failed: ['error_reason'],
    },
  });
}
