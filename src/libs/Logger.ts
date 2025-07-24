/**
 * 统一日志管理系统
 * 支持多种日志级别和输出目标
 */

import pino from 'pino';

// 日志级别定义
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// 日志配置接口
interface LoggerConfig {
  level: LogLevel;
  environment: string;
  service: string;
  version?: string;
  enableConsole: boolean;
  enableLogtail: boolean;
  logtailToken?: string;
}

// 获取默认配置
function getDefaultConfig(): LoggerConfig {
  return {
    level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    environment: process.env.NODE_ENV || 'development',
    service: process.env.SERVICE_NAME || 'rolitt-app',
    version: process.env.APP_VERSION || '1.0.0',
    enableConsole: true,
    enableLogtail: !!process.env.LOGTAIL_TOKEN,
    logtailToken: process.env.LOGTAIL_TOKEN,
  };
}

// 创建 Pino 实例
function createPinoLogger(config: LoggerConfig) {
  const targets: any[] = [];

  // 控制台输出
  if (config.enableConsole) {
    targets.push({
      target: 'pino-pretty',
      level: config.level,
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });
  }

  // Logtail 输出
  if (config.enableLogtail && config.logtailToken) {
    targets.push({
      target: '@logtail/pino',
      level: config.level,
      options: {
        sourceToken: config.logtailToken,
      },
    });
  }

  return pino({
    level: config.level,
    base: {
      service: config.service,
      environment: config.environment,
      version: config.version,
    },
    transport: targets.length > 1 ? { targets } : targets[0],
  });
}

// 增强日志器类
export class EnhancedLogger {
  private pino: pino.Logger;
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...getDefaultConfig(), ...config };
    this.pino = createPinoLogger(this.config);
  }

  // 基础日志方法
  debug(message: string, meta?: any) {
    this.pino.debug(meta, message);
  }

  info(message: string, meta?: any) {
    this.pino.info(meta, message);
  }

  warn(message: string, meta?: any) {
    this.pino.warn(meta, message);
  }

  error(message: string, error?: Error | any, meta?: any) {
    const errorMeta = error instanceof Error 
      ? { error: { message: error.message, stack: error.stack }, ...meta }
      : { error, ...meta };
    
    this.pino.error(errorMeta, message);
  }

  // 专用日志方法
  performance(operation: string, duration: number, meta?: any) {
    this.pino.info({
      type: 'performance',
      operation,
      duration,
      ...meta,
    }, `Performance: ${operation} took ${duration}ms`);
  }

  apiCall(method: string, url: string, statusCode: number, duration: number, meta?: any) {
    this.pino.info({
      type: 'api_call',
      method,
      url,
      statusCode,
      duration,
      ...meta,
    }, `API Call: ${method} ${url} - ${statusCode} (${duration}ms)`);
  }

  userAction(userId: string, action: string, meta?: any) {
    this.pino.info({
      type: 'user_action',
      userId,
      action,
      ...meta,
    }, `User Action: ${userId} - ${action}`);
  }

  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) {
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.pino[logMethod]({
      type: 'security',
      event,
      severity,
      ...meta,
    }, `Security Event: ${event} (${severity})`);
  }
}

// 默认日志器实例
export const logger = new EnhancedLogger();

// 组件日志器创建函数
export function createComponentLogger(componentName: string): EnhancedLogger {
  return new EnhancedLogger({
    service: `${getDefaultConfig().service}-${componentName}`,
  });
}

// 性能测量工具
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  logger?: EnhancedLogger
): T | Promise<T> {
  const log = logger || exports.logger;
  const startTime = Date.now();

  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result
        .then((value) => {
          const duration = Date.now() - startTime;
          log.performance(operation, duration);
          return value;
        })
        .catch((error) => {
          const duration = Date.now() - startTime;
          log.performance(operation, duration, { error: true });
          throw error;
        });
    } else {
      const duration = Date.now() - startTime;
      log.performance(operation, duration);
      return result;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log.performance(operation, duration, { error: true });
    throw error;
  }
}

// 导出类型
export type { LoggerConfig };