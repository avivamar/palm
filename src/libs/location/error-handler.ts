/**
 * 地址搜索服务错误处理和监控工具
 * 提供统一的错误处理、日志记录和用户友好的错误消息
 */

// 错误类型定义
export type LocationErrorType =
  | 'NETWORK_ERROR'
  | 'API_QUOTA_EXCEEDED'
  | 'INVALID_API_KEY'
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'INVALID_QUERY'
  | 'NO_RESULTS'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

// 错误详情接口
export type LocationError = {
  type: LocationErrorType;
  message: string;
  userMessage: string;
  service: 'google' | 'mapbox' | 'nominatim';
  originalError?: Error;
  timestamp: number;
  retryable: boolean;
};

// 错误统计接口
export type ErrorStats = {
  totalErrors: number;
  errorsByType: Record<LocationErrorType, number>;
  errorsByService: Record<string, number>;
  lastError?: LocationError;
};

/**
 * 地址搜索错误处理器
 */
export class LocationErrorHandler {
  private errorStats: ErrorStats = {
    totalErrors: 0,
    errorsByType: {} as Record<LocationErrorType, number>,
    errorsByService: {},
  };

  private errorCallbacks: Array<(error: LocationError) => void> = [];

  /**
   * 处理错误并返回标准化的错误对象
   */
  handleError(
    error: unknown,
    service: 'google' | 'mapbox' | 'nominatim',
    context?: string
  ): LocationError {
    const locationError = this.parseError(error, service);

    // 更新统计信息
    this.updateStats(locationError);

    // 记录错误日志
    this.logError(locationError, context);

    // 触发错误回调
    this.notifyErrorCallbacks(locationError);

    return locationError;
  }

  /**
   * 解析原始错误为标准化错误对象
   */
  private parseError(
    error: unknown,
    service: 'google' | 'mapbox' | 'nominatim'
  ): LocationError {
    const timestamp = Date.now();

    // 网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Network connection failed',
        userMessage: '网络连接失败，请检查网络设置',
        service,
        originalError: error as Error,
        timestamp,
        retryable: true,
      };
    }
    
    // HTTP 错误
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;

      switch (status) {
        case 401:
        case 403:
          return {
            type: 'INVALID_API_KEY',
            message: `Authentication failed for ${service}`,
            userMessage: '服务认证失败，正在尝试其他搜索方式',
            service,
            originalError: error as unknown as Error,
            timestamp,
            retryable: false,
          };

        case 429:
          return {
            type: 'RATE_LIMITED',
            message: `Rate limit exceeded for ${service}`,
            userMessage: '搜索请求过于频繁，正在尝试其他搜索方式',
            service,
            originalError: error as unknown as Error,
            timestamp,
            retryable: true,
          };

        case 402:
          return {
            type: 'API_QUOTA_EXCEEDED',
            message: `API quota exceeded for ${service}`,
            userMessage: '搜索配额已用完，正在尝试其他搜索方式',
            service,
            originalError: error as unknown as Error,
            timestamp,
            retryable: false,
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'SERVICE_UNAVAILABLE',
            message: `Service unavailable for ${service}`,
            userMessage: '搜索服务暂时不可用，正在尝试其他搜索方式',
            service,
            originalError: error as unknown as Error,
            timestamp,
            retryable: true,
          };
      }
    }

    // 超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        type: 'TIMEOUT',
        message: `Request timeout for ${service}`,
        userMessage: '搜索请求超时，正在尝试其他搜索方式',
        service,
        originalError: error,
        timestamp,
        retryable: true,
      };
    }

    // 默认未知错误
    return {
      type: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      userMessage: '搜索时发生未知错误，正在尝试其他搜索方式',
      service,
      originalError: error instanceof Error ? error : undefined,
      timestamp,
      retryable: true,
    };
  }

  /**
   * 更新错误统计信息
   */
  private updateStats(error: LocationError): void {
    this.errorStats.totalErrors++;
    this.errorStats.errorsByType[error.type] = (this.errorStats.errorsByType[error.type] || 0) + 1;
    this.errorStats.errorsByService[error.service] = (this.errorStats.errorsByService[error.service] || 0) + 1;
    this.errorStats.lastError = error;
  }

  /**
   * 记录错误日志
   */
  private logError(error: LocationError, context?: string): void {
    const logData = {
      type: error.type,
      service: error.service,
      message: error.message,
      timestamp: error.timestamp,
      context,
      retryable: error.retryable,
    };

    // 在开发环境中输出详细日志
    if (process.env.NODE_ENV === 'development') {
      console.warn('[LocationSearch Error]', logData, error.originalError);
    }

    // 在生产环境中可以发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成 Sentry、LogRocket 等监控服务
      // 例如: Sentry.captureException(error.originalError, { extra: logData });
    }
  }

  /**
   * 通知错误回调函数
   */
  private notifyErrorCallbacks(error: LocationError): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * 添加错误回调函数
   */
  onError(callback: (error: LocationError) => void): () => void {
    this.errorCallbacks.push(callback);

    // 返回取消订阅函数
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 获取错误统计信息
   */
  getStats(): ErrorStats {
    return { ...this.errorStats };
  }

  /**
   * 重置错误统计信息
   */
  resetStats(): void {
    this.errorStats = {
      totalErrors: 0,
      errorsByType: {} as Record<LocationErrorType, number>,
      errorsByService: {},
    };
  }

  /**
   * 检查错误是否可重试
   */
  isRetryable(error: LocationError): boolean {
    return error.retryable;
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(error: LocationError): string {
    return error.userMessage;
  }

  /**
   * 检查服务是否应该被跳过（基于错误历史）
   */
  shouldSkipService(service: 'google' | 'mapbox' | 'nominatim'): boolean {
    const serviceErrors = this.errorStats.errorsByService[service] || 0;
    const totalErrors = this.errorStats.totalErrors;

    // 如果某个服务的错误率超过 80%，暂时跳过
    if (totalErrors > 5 && serviceErrors / totalErrors > 0.8) {
      return true;
    }

    return false;
  }
}

// 全局错误处理器实例
export const locationErrorHandler = new LocationErrorHandler();

/**
 * 创建带有超时的 fetch 请求
 */
export function createTimeoutFetch(timeoutMs: number = 10000) {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
}

/**
 * 重试机制装饰器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw lastError;
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}