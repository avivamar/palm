import { Buffer } from 'node:buffer';
import { createHash, timingSafeEqual } from 'node:crypto';
// import { WebhookLogger } from '@/libs/webhook-logger';

/**
 * 增强的 Webhook 签名验证
 * 支持多种签名算法和时间戳验证
 */

// 支持的签名算法
type SignatureAlgorithm = 'sha256' | 'sha512';

// Webhook 配置
type WebhookConfig = {
  algorithm: SignatureAlgorithm;
  tolerance: number; // 时间容差（秒）
};

// 默认配置
const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  algorithm: 'sha256',
  tolerance: 300, // 5分钟
};

/**
 * 生成 Webhook 签名
 * @param payload 请求体
 * @param secret 密钥
 * @param algorithm 签名算法
 * @param timestamp 时间戳
 * @returns 签名字符串
 */
export function generateWebhookSignature(
  payload: string | Buffer,
  secret: string,
  algorithm: SignatureAlgorithm = 'sha256',
  timestamp?: number,
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;

  const signature = createHash(algorithm)
    .update(signedPayload + secret, 'utf8')
    .digest('hex');

  return `t=${ts},${algorithm}=${signature}`;
}

/**
 * 验证 Webhook 签名
 * @param payload 请求体
 * @param signature 签名
 * @param secret 密钥
 * @param config 配置选项
 * @returns 验证结果
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  config: Partial<WebhookConfig> = {},
): { isValid: boolean; timestamp?: number; error?: string } {
  const finalConfig = { ...DEFAULT_WEBHOOK_CONFIG, ...config } as WebhookConfig;

  try {
    // 解析签名头
    const elements = signature.split(',');
    let timestamp: number | undefined;
    let hash: string | undefined;

    for (const element of elements) {
      const [key, value] = element.split('=');
      if (key === 't' && value) {
        timestamp = Number.parseInt(value, 10);
      } else if (key === finalConfig.algorithm && value) {
        hash = value;
      }
    }

    if (!timestamp || !hash) {
      return { isValid: false, error: 'Invalid signature format' };
    }

    // 检查时间戳
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - timestamp) > finalConfig.tolerance) {
      return { isValid: false, error: 'Timestamp outside tolerance' };
    }

    // 生成期望的签名
    const expectedSignature = generateWebhookSignature(
      payload,
      secret,
      finalConfig.algorithm,
      timestamp,
    );

    // 提取期望的哈希值
    const expectedHash = expectedSignature.split(`${finalConfig.algorithm}=`)[1];

    if (!expectedHash) {
      return { isValid: false, error: 'Failed to extract expected hash from signature' };
    }

    // 使用时间安全比较
    const isValid = timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex'),
    );

    if (isValid) {
      console.warn(`[WebhookSecurity] Signature verified successfully for timestamp ${timestamp}`);
    }

    return { isValid, timestamp };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
    };
  }
}

// Webhook 重试配置
export type WebhookRetryConfig = {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
};

// 默认重试配置
const DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000, // 1秒
  maxDelayMs: 30000, // 30秒
  backoffMultiplier: 2,
};

// Webhook 事件去重缓存
const processedEvents = new Map<string, { timestamp: number; result: any }>();
const DEDUP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

/**
 * 清理过期的去重缓存
 */
function cleanupDedupCache() {
  const now = Date.now();
  for (const [eventId, data] of processedEvents.entries()) {
    if (now - data.timestamp > DEDUP_CACHE_TTL) {
      processedEvents.delete(eventId);
    }
  }
}

/**
 * 检查事件是否已处理（去重）
 * @param eventId Stripe 事件 ID
 * @returns 如果已处理返回之前的结果，否则返回 null
 */
export function checkEventDuplication(eventId: string): any | null {
  cleanupDedupCache();
  const cached = processedEvents.get(eventId);
  return cached ? cached.result : null;
}

/**
 * 标记事件为已处理
 * @param eventId Stripe 事件 ID
 * @param result 处理结果
 */
export function markEventAsProcessed(eventId: string, result: any): void {
  processedEvents.set(eventId, {
    timestamp: Date.now(),
    result,
  });
}

/**
 * 计算指数退避延迟时间
 * @param attempt 当前重试次数（从 0 开始）
 * @param config 重试配置
 * @returns 延迟时间（毫秒）
 */
export function calculateBackoffDelay(attempt: number, config: WebhookRetryConfig = DEFAULT_RETRY_CONFIG): number {
  const delay = config.baseDelayMs * config.backoffMultiplier ** attempt;
  return Math.min(delay, config.maxDelayMs);
}

/**
 * 带重试的异步函数执行器
 * @param fn 要执行的异步函数
 * @param config 重试配置
 * @param context 上下文信息（用于日志）
 * @returns 执行结果
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: WebhookRetryConfig = DEFAULT_RETRY_CONFIG,
  context: { eventType: string; eventId: string; operation: string } = {
    eventType: 'unknown',
    eventId: 'unknown',
    operation: 'unknown',
  },
): Promise<T> {
  let lastError: Error = new Error('No attempts were made');

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await fn();

      // 如果不是第一次尝试，记录重试成功
      if (attempt > 0) {
        console.warn(`✅ Webhook operation succeeded after ${attempt} retries`, {
          eventType: context.eventType,
          eventId: context.eventId,
          operation: context.operation,
          attempt,
        });
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // 如果是最后一次尝试，不再重试
      if (attempt === config.maxRetries) {
        console.error(`❌ Webhook operation failed after ${config.maxRetries} retries`, {
          eventType: context.eventType,
          eventId: context.eventId,
          operation: context.operation,
          error: lastError.message,
          totalAttempts: attempt + 1,
        });
        break;
      }

      // 计算延迟时间
      const delay = calculateBackoffDelay(attempt, config);

      console.warn(`⚠️ Webhook operation failed, retrying in ${delay}ms`, {
        eventType: context.eventType,
        eventId: context.eventId,
        operation: context.operation,
        attempt: attempt + 1,
        maxRetries: config.maxRetries,
        error: lastError.message,
        nextRetryIn: `${delay}ms`,
      });

      // 等待指定时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 增强的 Webhook 签名验证
 * @param payload 请求体
 * @param signature Stripe 签名
 * @param secret Webhook 密钥
 * @param tolerance 时间容差（秒）
 * @returns Stripe 事件对象
 */
export async function enhancedWebhookSignatureVerification(
  payload: string | Buffer,
  signature: string,
  secret: string,
  tolerance: number = 300, // 5分钟
): Promise<any> {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Please check your environment variables.');
  }

  const Stripe = (await import('stripe')).default;
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
  });

  // 使用 Stripe 的内置验证
  const event = stripeInstance.webhooks.constructEvent(
    payload,
    signature,
    secret,
  );

  // 检查时间戳是否在容差范围内
  const eventTimestamp = event.created;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTimestamp - eventTimestamp);

  if (timeDiff > tolerance) {
    throw new Error(`Event timestamp is too old. Time difference: ${timeDiff}s, tolerance: ${tolerance}s`);
  }

  return event;
}

/**
 * Webhook 签名验证结果检查
 * @param payload 请求体
 * @param signature Webhook 签名
 * @param secret Webhook 密钥
 * @param tolerance 时间容差（秒）
 * @returns 验证结果对象
 */
export async function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  tolerance: number = 300, // 5分钟
): Promise<{ isValid: boolean; error?: string; timestamp?: number; event?: any }> {
  try {
    const event = await enhancedWebhookSignatureVerification(payload, signature, secret, tolerance);
    return {
      isValid: true,
      timestamp: event.created,
      event,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown signature verification error',
    };
  }
}

/**
 * Webhook 处理状态监控
 */
export class WebhookMonitor {
  private static instance: WebhookMonitor;
  private metrics: Map<string, {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
    lastProcessedAt: number;
  }> = new Map();

  static getInstance(): WebhookMonitor {
    if (!WebhookMonitor.instance) {
      WebhookMonitor.instance = new WebhookMonitor();
    }
    return WebhookMonitor.instance;
  }

  /**
   * 记录 Webhook 事件处理开始
   * @param eventType 事件类型
   * @returns 开始时间戳
   */
  startProcessing(eventType: string): number {
    const startTime = Date.now();

    if (!this.metrics.has(eventType)) {
      this.metrics.set(eventType, {
        totalEvents: 0,
        successfulEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        lastProcessedAt: 0,
      });
    }

    const metric = this.metrics.get(eventType)!;
    metric.totalEvents++;

    return startTime;
  }

  /**
   * 记录 Webhook 事件处理成功
   * @param eventType 事件类型
   * @param startTime 开始时间戳
   */
  recordSuccess(eventType: string, startTime: number): void {
    const processingTime = Date.now() - startTime;

    // 🔧 确保 metric 存在
    if (!this.metrics.has(eventType)) {
      this.metrics.set(eventType, {
        totalEvents: 1,
        successfulEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        lastProcessedAt: 0,
      });
    }

    const metric = this.metrics.get(eventType)!;

    metric.successfulEvents++;
    metric.lastProcessedAt = Date.now();

    // 更新平均处理时间
    const totalSuccessful = metric.successfulEvents;
    metric.averageProcessingTime = (
      (metric.averageProcessingTime * (totalSuccessful - 1) + processingTime) / totalSuccessful
    );
  }

  /**
   * 记录 Webhook 事件处理失败
   * @param eventType 事件类型
   */
  recordFailure(eventType: string): void {
    // 🔧 确保 metric 存在
    if (!this.metrics.has(eventType)) {
      this.metrics.set(eventType, {
        totalEvents: 1,
        successfulEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        lastProcessedAt: 0,
      });
    }

    const metric = this.metrics.get(eventType)!;
    metric.failedEvents++;
    metric.lastProcessedAt = Date.now();
  }

  /**
   * 记录重复的 Webhook 事件
   * @param eventType 事件类型
   */
  recordDuplicate(eventType: string): void {
    // 重复事件不计入失败，但会记录到日志中
    console.warn(`[WebhookMonitor] Duplicate event recorded: ${eventType}`);
  }

  /**
   * 获取监控指标
   * @param eventType 事件类型（可选）
   * @returns 监控指标
   */
  getMetrics(eventType?: string) {
    if (eventType) {
      return this.metrics.get(eventType) || null;
    }

    // 返回所有指标的汇总
    const allMetrics = Array.from(this.metrics.entries());
    const summary = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageProcessingTime: 0,
      successRate: 0,
      eventTypes: {} as Record<string, any>,
    };

    for (const [type, metric] of allMetrics) {
      summary.totalEvents += metric.totalEvents;
      summary.successfulEvents += metric.successfulEvents;
      summary.failedEvents += metric.failedEvents;
      summary.eventTypes[type] = metric;
    }

    summary.successRate = summary.totalEvents > 0
      ? (summary.successfulEvents / summary.totalEvents) * 100
      : 0;

    summary.averageProcessingTime = allMetrics.length > 0
      ? allMetrics.reduce((sum, [, metric]) => sum + metric.averageProcessingTime, 0) / allMetrics.length
      : 0;

    return summary;
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics.clear();
  }
}
