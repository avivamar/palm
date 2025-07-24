/**
 * 🚨 生产环境错误恢复和超时处理工具
 *
 * 用于处理生产环境中的常见错误：
 * - 数据库连接超时
 * - Firebase 初始化失败
 * - 第三方服务超时
 * - 网络请求失败
 */

// 超时配置 - 针对 Vercel 环境优化
export const TIMEOUT_CONFIG = {
  // 数据库操作
  database: {
    connection: 5000, // 5秒连接超时
    query: 3000, // 3秒查询超时
    transaction: 8000, // 8秒事务超时
  },

  // Firebase 操作
  firebase: {
    init: 8000, // 8秒初始化超时
    auth: 5000, // 5秒认证超时
    verify: 3000, // 3秒验证超时
  },

  // 第三方服务
  external: {
    klaviyo: 3000, // 3秒 Klaviyo 超时
    stripe: 10000, // 10秒 Stripe 超时
    notion: 5000, // 5秒 Notion 超时
  },

  // HTTP 请求
  http: {
    api: 8000, // 8秒 API 超时
    webhook: 15000, // 15秒 Webhook 超时
  },
};

// 重试配置
// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 100, // 100ms
  maxDelay: 2000, // 2秒
  backoffFactor: 2, // 指数退避因子
};

/**
 * 🕐 超时包装器 - 为任何 Promise 添加超时
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation = 'Operation',
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    }),
  ]);
}

/**
 * 🔄 指数退避重试机制
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    operation?: string;
  } = {},
): Promise<T> {
  const {
    maxRetries = RETRY_CONFIG.maxRetries,
    baseDelay = RETRY_CONFIG.baseDelay,
    maxDelay = RETRY_CONFIG.maxDelay,
    backoffFactor = RETRY_CONFIG.backoffFactor,
    operation = 'Operation',
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        console.error(`[ErrorRecovery] ${operation} failed after ${maxRetries + 1} attempts:`, lastError);
        throw lastError || new Error('Unknown error occurred');
      }

      const delay = Math.min(
        baseDelay * (backoffFactor ** attempt),
        maxDelay,
      );

      console.warn(`[ErrorRecovery] ${operation} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 🛡️ 安全执行器 - 捕获错误并提供降级选项
 */
export async function safeExecute<T, F = T>(
  fn: () => Promise<T>,
  fallback: F | (() => Promise<F>),
  operation = 'Operation',
): Promise<T | F> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[ErrorRecovery] ${operation} failed, using fallback:`, error);

    if (typeof fallback === 'function') {
      try {
        return await (fallback as () => Promise<F>)();
      } catch (fallbackError) {
        console.error(`[ErrorRecovery] ${operation} fallback also failed:`, fallbackError);
        throw fallbackError;
      }
    }

    return fallback;
  }
}

/**
 * 🔍 健康检查工具
 */
export class HealthChecker {
  private static checks: Map<string, () => Promise<boolean>> = new Map();

  static register(name: string, check: () => Promise<boolean>) {
    this.checks.set(name, check);
  }

  static async checkAll(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const [name, check] of this.checks) {
      try {
        results[name] = await withTimeout(check(), 5000, `Health check: ${name}`);
      } catch (error) {
        console.error(`[HealthCheck] ${name} failed:`, error);
        results[name] = false;
      }
    }

    return results;
  }

  static async isHealthy(): Promise<boolean> {
    const results = await this.checkAll();
    return Object.values(results).every(Boolean);
  }
}

/**
 * 📊 错误统计和监控
 */
export class ErrorTracker {
  private static errors: Map<string, number> = new Map();
  private static lastReset = Date.now();

  static track(operation: string, error: Error) {
    const count = this.errors.get(operation) || 0;
    this.errors.set(operation, count + 1);

    // 每小时重置统计
    if (Date.now() - this.lastReset > 3600000) {
      this.reset();
    }

    console.error(`[ErrorTracker] ${operation} error count: ${count + 1}`, {
      error: error.message,
      stack: error.stack,
    });
  }

  static getStats(): { [key: string]: number } {
    return Object.fromEntries(this.errors);
  }

  static reset() {
    this.errors.clear();
    this.lastReset = Date.now();
    console.warn('[ErrorTracker] Error statistics reset');
  }
}

/**
 * 🚨 断路器模式实现
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1分钟
    private readonly name = 'CircuitBreaker',
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.warn(`[${this.name}] Circuit breaker transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.error(`[${this.name}] Circuit breaker OPENED after ${this.failures} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * 🔧 常用错误恢复函数
 */
export const ErrorRecovery = {
  /**
   * 数据库操作错误恢复
   */
  async database<T>(fn: () => Promise<T>, operation = 'Database operation'): Promise<T> {
    return retryWithBackoff(
      () => withTimeout(fn(), TIMEOUT_CONFIG.database.query, operation),
      { operation },
    );
  },

  /**
   * Firebase 操作错误恢复
   */
  async firebase<T>(fn: () => Promise<T>, operation = 'Firebase operation'): Promise<T> {
    return retryWithBackoff(
      () => withTimeout(fn(), TIMEOUT_CONFIG.firebase.auth, operation),
      { operation, maxRetries: 2 },
    );
  },

  /**
   * 第三方服务错误恢复
   */
  async external<T>(fn: () => Promise<T>, service: string, timeoutMs?: number): Promise<T> {
    const timeout = timeoutMs || TIMEOUT_CONFIG.external.klaviyo;
    return retryWithBackoff(
      () => withTimeout(fn(), timeout, `${service} operation`),
      { operation: service, maxRetries: 2 },
    );
  },
};

// 导出默认配置
export default {
  withTimeout,
  retryWithBackoff,
  safeExecute,
  HealthChecker,
  ErrorTracker,
  CircuitBreaker,
  ErrorRecovery,
  TIMEOUT_CONFIG,
  RETRY_CONFIG,
};
