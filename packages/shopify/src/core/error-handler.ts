/**
 * Shopify 错误处理器
 * 提供统一的错误处理、分类、重试和日志记录
 */

export type ErrorClassification = {
  type: 'NETWORK' | 'AUTHENTICATION' | 'AUTHORIZATION' | 'VALIDATION' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'UNKNOWN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  statusCode?: number;
};

export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
};

export type ErrorContext = {
  operation: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
};

export class ShopifyErrorHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  };

  /**
   * 分类错误类型
   */
  public static classifyError(error: any): ErrorClassification {
    // HTTP 状态码错误
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;

      switch (status) {
        case 401:
          return {
            type: 'AUTHENTICATION',
            severity: 'HIGH',
            retryable: false,
            statusCode: status,
          };
        case 403:
          return {
            type: 'AUTHORIZATION',
            severity: 'HIGH',
            retryable: false,
            statusCode: status,
          };
        case 422:
          return {
            type: 'VALIDATION',
            severity: 'MEDIUM',
            retryable: false,
            statusCode: status,
          };
        case 429:
          return {
            type: 'RATE_LIMIT',
            severity: 'MEDIUM',
            retryable: true,
            statusCode: status,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'SERVER_ERROR',
            severity: 'HIGH',
            retryable: true,
            statusCode: status,
          };
        default:
          return {
            type: 'UNKNOWN',
            severity: 'MEDIUM',
            retryable: status >= 500,
            statusCode: status,
          };
      }
    }

    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return {
        type: 'NETWORK',
        severity: 'HIGH',
        retryable: true,
      };
    }

    // 其他错误
    return {
      type: 'UNKNOWN',
      severity: 'MEDIUM',
      retryable: false,
    };
  }

  /**
   * 带重试的操作执行
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    retryConfig: Partial<RetryConfig> = {},
  ): Promise<T> {
    const config = { ...this.DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: any;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        this.logInfo(`Attempting operation: ${context.operation} (attempt ${attempt + 1}/${config.maxRetries + 1})`, context);
        const result = await operation();

        if (attempt > 0) {
          this.logInfo(`Operation succeeded after ${attempt + 1} attempts: ${context.operation}`, context);
        }

        return result;
      } catch (error) {
        lastError = error;
        const classification = this.classifyError(error);

        this.logError(
          `Operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}): ${context.operation}`,
          error,
          { ...context, classification, attempt },
        );

        // 如果不可重试或已达到最大重试次数，直接抛出错误
        if (!classification.retryable || attempt >= config.maxRetries) {
          break;
        }

        // 计算延迟时间（指数退避）
        const delay = Math.min(
          config.baseDelay * config.backoffMultiplier ** attempt,
          config.maxDelay,
        );

        // 针对速率限制，使用更长的延迟
        const finalDelay = classification.type === 'RATE_LIMIT' ? delay * 2 : delay;

        this.logWarning(`Retrying in ${finalDelay}ms...`, { ...context, delay: finalDelay, attempt });
        await this.delay(finalDelay);
      }
    }

    throw lastError;
  }

  /**
   * 处理 API 错误
   */
  public static handleApiError(error: any, context: string, metadata?: Record<string, any>): any {
    const classification = this.classifyError(error);
    const errorContext: ErrorContext = {
      operation: context,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.logError(`API Error in ${context}`, error, { ...errorContext, classification });

    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      context,
      classification,
      timestamp: errorContext.timestamp,
    };
  }

  /**
   * 处理同步错误
   */
  public static handleSyncError(error: any, syncType: string, itemId?: string): any {
    const classification = this.classifyError(error);
    const errorContext: ErrorContext = {
      operation: `${syncType}Sync`,
      timestamp: new Date().toISOString(),
      metadata: { itemId, syncType },
    };

    this.logError(
      `Sync Error: ${syncType}${itemId ? ` (ID: ${itemId})` : ''}`,
      error,
      { ...errorContext, classification },
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : '同步失败',
      syncType,
      itemId,
      classification,
      timestamp: errorContext.timestamp,
    };
  }

  /**
   * 记录错误
   */
  public static logError(message: string, error: any, context?: any): void {
    const errorDetails = {
      message,
      error: error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error(`[Shopify] ERROR: ${message}`, errorDetails);
  }

  /**
   * 记录警告
   */
  public static logWarning(message: string, context?: any): void {
    const logEntry = {
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.warn(`[Shopify] WARNING: ${message}`, logEntry);
  }

  /**
   * 记录信息
   */
  public static logInfo(message: string, context?: any): void {
    const logEntry = {
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Shopify] INFO: ${message}`, logEntry);
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 创建带重试的 API 客户端包装器
   */
  public static createRetryableApiCall<T>(
    apiCall: () => Promise<T>,
    operation: string,
    metadata?: Record<string, any>,
  ): Promise<T> {
    const context: ErrorContext = {
      operation,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata,
    };

    return this.withRetry(apiCall, context);
  }
}
