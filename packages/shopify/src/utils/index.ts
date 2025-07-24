/**
 * Shopify 工具函数
 */

/**
 * 格式化价格
 */
export function formatPrice(price: string | number, currency = 'USD'): string {
  const amount = typeof price === 'string' ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * 生成 Shopify Admin URL
 */
export function getShopifyAdminUrl(storeDomain: string, path: string): string {
  const cleanDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${cleanDomain}/admin${path}`;
}

/**
 * 验证 Shopify 商店域名格式
 */
export function isValidShopifyDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(domain);
}

/**
 * 解析 Shopify ID (从 GraphQL ID 中提取数字 ID)
 */
export function parseShopifyId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match?.[1] || gid;
}

/**
 * 构建 GraphQL ID
 */
export function buildGraphQLId(resource: string, id: string | number): string {
  return `gid://shopify/${resource}/${id}`;
}

/**
 * 批量处理工具
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    delayMs?: number;
  } = {},
): Promise<R[]> {
  const { batchSize = 10, delayMs = 100 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    // 添加延迟以避免速率限制
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    backoff?: boolean;
  } = {},
): Promise<T> {
  const { attempts = 3, delay = 1000, backoff = true } = options;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) {
        throw error;
      }

      const waitTime = backoff ? delay * 2 ** i : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Retry failed');
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = output[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (isObject(targetValue) && isObject(sourceValue)) {
      output[key as keyof T] = deepMerge(targetValue, sourceValue) as any;
    } else {
      output[key as keyof T] = sourceValue as any;
    }
  });

  return output;
}

function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 数据脱敏
 */
export function sanitizeData(data: any, fieldsToMask: string[] = []): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const defaultFieldsToMask = ['password', 'token', 'secret', 'credit_card', 'ssn'];
  const allFieldsToMask = [...defaultFieldsToMask, ...fieldsToMask];

  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};

      Object.keys(obj).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (allFieldsToMask.some(field => lowerKey.includes(field))) {
          sanitized[key] = '***MASKED***';
        } else {
          sanitized[key] = sanitize(obj[key]);
        }
      });

      return sanitized;
    }

    return obj;
  };

  return sanitize(data);
}
