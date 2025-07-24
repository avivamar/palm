'use server';

// 定义 API 响应的统一返回类型
type SubscriptionResult = {
  success: boolean;
  message: string;
};

// 超时配置
const TIMEOUT_CONFIG = {
  klaviyoApi: 8000, // 8秒 - Klaviyo API调用
  validation: 1000, // 1秒 - 邮箱验证
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

// 指数退避重试函数
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // 对于网络错误或超时错误才重试
      if (error instanceof Error
        && (error.message.includes('timed out')
          || error.message.includes('network')
          || error.message.includes('ECONNRESET')
          || error.message.includes('ETIMEDOUT'))) {
        const delay = baseDelay * (2 ** (attempt - 1));
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// 封装 Klaviyo API 调用
async function subscribeProfileToList(email: string): Promise<SubscriptionResult> {
  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Klaviyo API Key or List ID is not configured.');
    return { success: false, message: 'Server configuration error.' };
  }

  try {
    // 步骤 1: 创建或查找 Profile，获取其 ID (带重试机制)
    const profileResponse = await retryWithBackoff(async () => {
      return await withTimeout(
        fetch('https://a.klaviyo.com/api/profiles/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${apiKey}`,
            'Content-Type': 'application/json',
            'revision': '2024-02-15',
          },
          body: JSON.stringify({ data: { type: 'profile', attributes: { email } } }),
        }),
        TIMEOUT_CONFIG.klaviyoApi,
      );
    });

    if (profileResponse.status !== 201 && profileResponse.status !== 409) {
      const errorData = await profileResponse.json();
      throw new Error(errorData.errors?.[0]?.detail || 'Failed to create or find profile.');
    }

    const getProfileResponse = await retryWithBackoff(async () => {
      return await withTimeout(
        fetch(`https://a.klaviyo.com/api/profiles/?filter=equals(email,"${email}")`, {
          headers: { Authorization: `Klaviyo-API-Key ${apiKey}`, revision: '2024-02-15' },
        }),
        TIMEOUT_CONFIG.klaviyoApi,
      );
    });
    const profileData = await getProfileResponse.json();
    const profileId = profileData.data?.[0]?.id;

    if (!profileId) {
      throw new Error('Could not retrieve profile ID from Klaviyo.');
    }

    // 步骤 2: 将 Profile 添加到指定的 List (带重试机制)
    const subscribeResponse = await retryWithBackoff(async () => {
      return await withTimeout(
        fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${apiKey}`,
            'Content-Type': 'application/json',
            'revision': '2024-02-15',
          },
          body: JSON.stringify({ data: [{ type: 'profile', id: profileId }] }),
        }),
        TIMEOUT_CONFIG.klaviyoApi,
      );
    });

    if (subscribeResponse.ok || subscribeResponse.status === 409) {
      return { success: true, message: 'Thank you for subscribing!' };
    }

    const errorData = await subscribeResponse.json();
    throw new Error(errorData.errors?.[0]?.detail || 'Failed to subscribe profile to the list.');
  } catch (error) {
    console.error('Klaviyo subscription failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 脱敏邮箱
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return { success: false, message: 'Service temporarily unavailable. Please try again later.' };
    }

    // 处理网络错误
    if (error instanceof Error
      && (error.message.includes('network')
        || error.message.includes('ECONNRESET')
        || error.message.includes('ETIMEDOUT'))) {
      return { success: false, message: 'Network error. Please check your connection and try again.' };
    }

    return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}

// Server Action: 供客户端调用
export async function subscribeToNewsletter(email: string): Promise<SubscriptionResult> {
  try {
    // 邮箱验证 (带超时)
    const isValidEmail = await withTimeout(
      Promise.resolve(email && /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)),
      TIMEOUT_CONFIG.validation,
    );

    if (!isValidEmail) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    return await subscribeProfileToList(email);
  } catch (error) {
    console.error('Newsletter subscription validation failed:', error);
    return { success: false, message: 'Validation failed. Please try again.' };
  }
}
