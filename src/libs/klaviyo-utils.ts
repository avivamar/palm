import type { KlaviyoEventPayload } from './Klaviyo';
import { Klaviyo } from './Klaviyo';

// 缓存已发送的事件，避免重复发送
const sentEvents = new Set<string>();

/**
 * 生成事件的唯一标识符
 * @param eventName 事件名称
 * @param email 用户邮箱
 * @param uniqueId 唯一标识符（如 payment_intent_id, preorder_id 等）
 */
function generateEventKey(eventName: string, email: string, uniqueId: string): string {
  return `${eventName}:${email}:${uniqueId}`;
}

/**
 * 幂等发送 Klaviyo 事件
 * @param eventName 事件名称
 * @param email 用户邮箱
 * @param properties 事件属性
 * @param uniqueId 唯一标识符，用于防止重复发送
 */
export async function sendKlaviyoEventIdempotent(
  eventName: string,
  email: string,
  properties: Record<string, any>,
  uniqueId: string,
) {
  const eventKey = generateEventKey(eventName, email, uniqueId);

  // 检查是否已发送过此事件
  if (sentEvents.has(eventKey)) {
    return null;
  }

  try {
    const result = await Klaviyo.track(eventName, {
      email,
      ...properties,
    });

    if (result) {
      // 标记事件已发送
      sentEvents.add(eventKey);
    }

    return result;
  } catch (error) {
    console.error(`[Klaviyo] Failed to send event ${eventName}:`, error);
    return null;
  }
}

/**
 * 带重试机制的 Klaviyo 事件发送
 * @param payload Klaviyo 事件负载
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟（毫秒）
 */
export async function sendKlaviyoEventWithRetry(
  payload: KlaviyoEventPayload,
  maxRetries: number = 3,
  retryDelay: number = 1000,
) {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Klaviyo.sendEventToKlaviyo(payload);
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
      console.warn(`[Klaviyo] Attempt ${attempt} failed for event ${payload.event}:`, error);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // 指数退避
      }
    }
  }

  console.error(`[Klaviyo] All ${maxRetries} attempts failed for event ${payload.event}:`, lastError);
  return null;
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Thepalmistrylife 预售事件工具类
 */
export const RolittKlaviyoEvents = {
  /**
   * 发送预售开始事件（幂等）
   */
  async preorderStarted(
    email: string,
    properties: {
      color: string;
      preorder_id: string;
      preorder_number?: string;
      locale?: string;
      source?: string;
      user_created?: boolean;
      marketing_stage?: string;
    },
  ) {
    if (!isValidEmail(email)) {
      console.warn(`[Klaviyo] Invalid email format: ${email}`);
      return null;
    }

    return await sendKlaviyoEventIdempotent(
      'Rolitt Preorder Started',
      email,
      {
        ...properties,
        preorder_number: properties.preorder_number || `ROL-${Date.now()}`,
        locale: properties.locale || 'en',
        source: properties.source || 'Stripe Checkout',
        user_created: properties.user_created || false,
        marketing_stage: properties.marketing_stage || 'preorder_started',
      },
      properties.preorder_id,
    );
  },

  /**
   * 发送预售成功事件（幂等）
   */
  async preorderSuccess(
    email: string,
    properties: {
      color: string;
      preorder_id: string;
      preorder_number?: string;
      locale?: string;
      amount?: number;
      currency?: string;
      payment_intent_id?: string;
      session_id?: string;
    },
  ) {
    if (!isValidEmail(email)) {
      console.warn(`[Klaviyo] Invalid email format: ${email}`);
      return null;
    }

    // 统一使用新版 Events API
    return await Klaviyo.track('Rolitt Preorder Success', {
      email, // 新版 API 需要 email 在 properties 中
      ...properties,
      // 确保默认值仍然存在
      preorder_number: properties.preorder_number || `ROL-${Date.now()}`,
      locale: properties.locale || 'en',
      amount: properties.amount || 0,
      currency: properties.currency || 'usd',
      source: 'Stripe Webhook',
    });
  },

  /**
   * 🎯 混合营销模式 - 支付完成事件（用户创建并关联预订）
   */
  async preorderCompleted(
    email: string,
    properties: {
      color: string;
      preorder_id: string;
      preorder_number?: string;
      locale?: string;
      amount?: string;
      currency?: string;
      user_created?: boolean;
      marketing_stage?: string;
      phone?: string | null;
    },
  ) {
    if (!isValidEmail(email)) {
      console.warn(`[Klaviyo] Invalid email format: ${email}`);
      return null;
    }

    return await sendKlaviyoEventIdempotent(
      'Rolitt Preorder Completed',
      email,
      {
        ...properties,
        preorder_number: properties.preorder_number || `ROL-${Date.now()}`,
        locale: properties.locale || 'en',
        amount: properties.amount || '0.00',
        currency: properties.currency || 'USD',
        user_created: properties.user_created || false,
        marketing_stage: properties.marketing_stage || 'payment_completed',
        source: 'Hybrid Marketing System',
      },
      properties.preorder_id,
    );
  },

  /**
   * 🎯 混合营销模式 - 放弃购物车事件
   */
  async abandonedCart(
    email: string,
    properties: {
      color: string;
      preorder_id: string;
      preorder_number?: string;
      locale?: string;
      cart_value?: string;
      currency?: string;
      marketing_stage?: string;
      abandoned_at?: string;
    },
  ) {
    if (!isValidEmail(email)) {
      console.warn(`[Klaviyo] Invalid email format: ${email}`);
      return null;
    }

    return await sendKlaviyoEventIdempotent(
      'Rolitt Abandoned Cart',
      email,
      {
        ...properties,
        preorder_number: properties.preorder_number || `ROL-${Date.now()}`,
        locale: properties.locale || 'en',
        cart_value: properties.cart_value || '0.00',
        currency: properties.currency || 'USD',
        marketing_stage: properties.marketing_stage || 'abandoned_cart',
        abandoned_at: properties.abandoned_at || new Date().toISOString(),
        source: 'Hybrid Marketing System',
      },
      properties.preorder_id,
    );
  },

  /**
   * 发送预售失败事件
   */
  async preorderFailed(
    email: string,
    properties: {
      color: string;
      preorder_id: string;
      error_reason?: string;
      locale?: string;
    },
  ) {
    if (!isValidEmail(email)) {
      console.warn(`[Klaviyo] Invalid email format: ${email}`);
      return null;
    }

    return await Klaviyo.sendEventToKlaviyo({
      event: 'Rolitt Preorder Failed',
      customer_properties: {
        $email: email,
      },
      properties: {
        ...properties,
        error_reason: properties.error_reason || 'Unknown error',
        locale: properties.locale || 'en',
        source: 'Stripe Webhook',
      },
    });
  },
};
