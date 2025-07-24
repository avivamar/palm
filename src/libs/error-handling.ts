/**
 * 标准化错误处理工具
 * 提供一致的错误处理模式和用户友好的错误消息
 */

import { logger } from './Logger';

// 错误类型定义
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  PAYMENT = 'PAYMENT',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL',
  RATE_LIMIT = 'RATE_LIMIT',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage?: string;
  code?: string;
  statusCode?: number;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

// 创建标准化错误
export function createError(
  type: ErrorType,
  message: string,
  options: {
    userMessage?: string;
    code?: string;
    statusCode?: number;
    details?: any;
    requestId?: string;
  } = {}
): AppError {
  return {
    type,
    message,
    userMessage: options.userMessage || getDefaultUserMessage(type),
    code: options.code,
    statusCode: options.statusCode || getDefaultStatusCode(type),
    details: options.details,
    timestamp: new Date(),
    requestId: options.requestId,
  };
}

// 获取默认用户消息
function getDefaultUserMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.VALIDATION:
      return '输入信息有误，请检查后重试';
    case ErrorType.AUTHENTICATION:
      return '请先登录后再试';
    case ErrorType.AUTHORIZATION:
      return '您没有权限执行此操作';
    case ErrorType.NOT_FOUND:
      return '请求的资源不存在';
    case ErrorType.NETWORK:
      return '网络连接异常，请稍后重试';
    case ErrorType.DATABASE:
      return '数据处理异常，请稍后重试';
    case ErrorType.PAYMENT:
      return '支付处理异常，请稍后重试';
    case ErrorType.EXTERNAL_API:
      return '外部服务暂时不可用，请稍后重试';
    case ErrorType.RATE_LIMIT:
      return '请求过于频繁，请稍后重试';
    case ErrorType.INTERNAL:
    default:
      return '系统异常，请稍后重试';
  }
}

// 获取默认状态码
function getDefaultStatusCode(type: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.RATE_LIMIT:
      return 429;
    case ErrorType.INTERNAL:
    case ErrorType.DATABASE:
    case ErrorType.EXTERNAL_API:
      return 500;
    case ErrorType.NETWORK:
    case ErrorType.PAYMENT:
    default:
      return 500;
  }
}

// 错误处理装饰器
export function handleErrors<T extends (...args: any[]) => any>(
  target: T,
  context: { component?: string; operation?: string } = {}
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = target(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          logError(error, context);
          throw normalizeError(error);
        });
      }
      
      return result;
    } catch (error) {
      logError(error, context);
      throw normalizeError(error);
    }
  }) as T;
}

// 异步错误处理包装器
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: { component?: string; operation?: string } = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw normalizeError(error);
  }
}

// 标准化错误对象
export function normalizeError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // 根据错误消息判断错误类型
    const type = inferErrorType(error.message);
    return createError(type, error.message, {
      details: { stack: error.stack },
    });
  }

  return createError(ErrorType.INTERNAL, 'Unknown error occurred', {
    details: error,
  });
}

// 判断是否为应用错误
function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'type' in error && 'timestamp' in error;
}

// 根据错误消息推断错误类型
function inferErrorType(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return ErrorType.NETWORK;
  }
  if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
    return ErrorType.DATABASE;
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('stripe')) {
    return ErrorType.PAYMENT;
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return ErrorType.RATE_LIMIT;
  }
  
  return ErrorType.INTERNAL;
}

// 记录错误日志
function logError(error: any, context: { component?: string; operation?: string } = {}) {
  const normalizedError = normalizeError(error);
  
  logger.error(
    `Error in ${context.component || 'Unknown'}.${context.operation || 'Unknown'}`,
    normalizedError,
    context
  );
}

// API 错误响应格式化
export function formatApiError(error: AppError) {
  return {
    success: false,
    error: {
      type: error.type,
      message: error.userMessage || error.message,
      code: error.code,
      timestamp: error.timestamp,
      requestId: error.requestId,
    },
  };
}

// 客户端错误处理 Hook
export function useErrorHandler() {
  const handleError = (error: any, context?: { component?: string; operation?: string }) => {
    const normalizedError = normalizeError(error);
    
    // 记录错误
    logger.error('Client error', normalizedError, context);
    
    // 可以在这里添加用户通知逻辑
    // 例如：显示 toast 消息、发送到错误监控服务等
    
    return normalizedError;
  };

  return { handleError };
}

// 重试机制
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryCondition?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryCondition = (error) => {
      const normalized = normalizeError(error);
      return normalized.type === ErrorType.NETWORK || normalized.type === ErrorType.EXTERNAL_API;
    },
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }
      
      const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      logger.warn(`Retrying operation (attempt ${attempt + 1}/${maxRetries})`, {
        error: normalizeError(error),
        delay: currentDelay,
      });
    }
  }
  
  throw lastError;
}