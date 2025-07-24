import { Env } from './Env';

const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/track';
const KLAVIYO_EVENTS_API_URL = 'https://a.klaviyo.com/api/events';

// Klaviyo 事件负载接口
type KlaviyoEventPayload = {
  event: string;
  customer_properties: {
    $email: string;
    [key: string]: any;
  };
  properties?: {
    [key: string]: any;
  };
  time?: number; // 可选时间戳
};

// Klaviyo 新版 API 负载接口
type KlaviyoNewAPIPayload = {
  data: {
    type: 'event';
    attributes: {
      profile: {
        data: {
          type: 'profile';
          attributes: {
            email: string;
            [key: string]: any;
          };
        };
      };
      metric: {
        data: {
          type: 'metric';
          attributes: {
            name: string;
          };
        };
      };
      properties?: { [key: string]: any };
      time?: string;
    };
  };
};

export const Klaviyo = {
  /**
   * 发送事件到 Klaviyo（使用传统 Track API）
   * @param payload Klaviyo 事件负载
   */
  async sendEventToKlaviyo(payload: KlaviyoEventPayload) {
    // 检查 API Key 是否配置
    if (!Env.KLAVIYO_API_KEY) {
      console.warn('[Klaviyo] API Key not configured, skipping tracking');
      return null;
    }

    try {
      const requestBody = {
        token: Env.KLAVIYO_API_KEY,
        ...payload,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(KLAVIYO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        if (response.status === 401) {
          console.warn('[Klaviyo] Authentication failed. Please check your API key. For server-side calls, you need a private API key, not a public key (pk_).');
        }
        console.error(`[Klaviyo] API Error: ${response.status} ${errorBody}`);
        return null;
      }

      // Event sent successfully
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Klaviyo Legacy] Request timeout after 10 seconds');
      } else {
        console.error('[Klaviyo Legacy] Error sending event:', error);
      }
      return null;
    }
  },

  /**
   * 发送事件到 Klaviyo（使用新版 Events API）
   * @param eventName 事件名称
   * @param properties 事件属性
   */
  async track(eventName: string, properties: Record<string, any>) {
    const { email, phone, ...rest } = properties;

    if (!email) {
      console.warn('[Klaviyo] Email is required for tracking, skipping event');
      return null;
    }

    // 检查 API Key 是否配置
    if (!Env.KLAVIYO_API_KEY) {
      console.warn('[Klaviyo] API Key not configured, skipping tracking');
      return null;
    }

    // 构建用户属性，包含手机号（如果有）
    const profileAttributes: { email: string; [key: string]: any } = { email };
    if (phone) {
      profileAttributes.phone_number = phone;
    }

    const payload: KlaviyoNewAPIPayload = {
      data: {
        type: 'event',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: profileAttributes,
            },
          },
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name: eventName,
              },
            },
          },
          properties: rest,
        },
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      const response = await fetch(KLAVIYO_EVENTS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${Env.KLAVIYO_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Klaviyo] API Error: ${response.status} ${response.statusText}`, {
          errorBody: errorText,
          requestId: response.headers.get('x-request-id'),
        });
        throw new Error(`Klaviyo API request failed with status ${response.status}`);
      }

      const responseText = await response.text();

      // Handle empty response body from Klaviyo, which can happen on success (202 Accepted)
      if (responseText) {
        try {
          return JSON.parse(responseText);
        } catch {
          console.warn(`[Klaviyo] Failed to parse response, but request was successful`);
          return { success: true, raw: responseText };
        }
      }

      return { success: true, status: response.status };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Klaviyo] Request timeout after 10 seconds');
      } else {
        console.error('[Klaviyo] Failed to send event:', error);
      }
      return null;
    }
  },

  /**
   * 预售开始事件（未支付）
   * @param email 用户邮箱
   * @param properties 事件属性
   */
  async trackPreorderStarted(email: string, properties: Record<string, any> = {}) {
    return await this.track('Rolitt Preorder Started', {
      email,
      source: 'Stripe Checkout',
      ...properties,
    });
  },

  /**
   * 预售成功事件（支付成功）
   * @param email 用户邮箱
   * @param properties 事件属性
   */
  async trackPreorderSuccess(email: string, properties: Record<string, any> = {}) {
    return await this.track('Rolitt Preorder Success', {
      email,
      source: 'Stripe Webhook',
      ...properties,
    });
  },
};

// 导出类型供其他模块使用
export type { KlaviyoEventPayload, KlaviyoNewAPIPayload };
