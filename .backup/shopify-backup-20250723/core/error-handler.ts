/**
 * 🛡️ Shopify错误处理器
 * 确保Shopify问题不影响核心系统
 */

import type { ShopifyApiResponse } from './client';

export class ShopifyErrorHandler {
  /**
   * 🔧 处理API错误
   */
  static handleApiError(error: any, operation: string): ShopifyApiResponse {
    const errorInfo = this.parseError(error);

    // 🚨 记录错误但不抛出异常
    console.error(`[ShopifyError] ${operation} failed:`, {
      message: errorInfo.message,
      code: errorInfo.code,
      status: errorInfo.status,
      operation,
      timestamp: new Date().toISOString(),
    });

    // 📊 发送监控告警（非阻塞）
    this.sendAlert(operation, errorInfo).catch((alertError) => {
      console.warn('[ShopifyError] Failed to send alert:', alertError);
    });

    // 💾 记录到错误日志表（非阻塞）
    this.logToDatabase(operation, errorInfo).catch((dbError) => {
      console.warn('[ShopifyError] Failed to log to database:', dbError);
    });

    // 🔄 返回安全的失败结果
    return {
      success: false,
      error: this.getUserFriendlyMessage(errorInfo),
      data: {
        coreSystemSafe: true,
        errorCode: errorInfo.code,
        canRetry: this.isRetryable(errorInfo),
      },
    };
  }

  /**
   * 🔍 解析错误信息
   */
  private static parseError(error: any): {
    message: string;
    code: string;
    status?: number;
    details?: any;
  } {
    // Shopify API错误
    if (error?.response?.data?.errors) {
      return {
        message: error.response.data.errors[0] || error.message,
        code: 'SHOPIFY_API_ERROR',
        status: error.response?.status,
        details: error.response.data,
      };
    }

    // 网络错误
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return {
        message: 'Shopify服务连接失败',
        code: 'NETWORK_ERROR',
        details: error.code,
      };
    }

    // 超时错误
    if (error?.code === 'ECONNABORTED' || error?.name === 'AbortError') {
      return {
        message: 'Shopify API请求超时',
        code: 'TIMEOUT',
        details: error.timeout,
      };
    }

    // 权限错误
    if (error?.status === 401 || error?.status === 403) {
      return {
        message: 'Shopify API权限验证失败',
        code: 'AUTH_ERROR',
        status: error.status,
      };
    }

    // 限流错误
    if (error?.status === 429) {
      return {
        message: 'Shopify API请求频率过高',
        code: 'RATE_LIMIT',
        status: 429,
        details: error.headers?.['retry-after'],
      };
    }

    // 通用错误
    return {
      message: error?.message || '未知Shopify错误',
      code: 'UNKNOWN_ERROR',
      status: error?.status,
      details: error,
    };
  }

  /**
   * 💬 获取用户友好的错误消息
   */
  private static getUserFriendlyMessage(errorInfo: any): string {
    switch (errorInfo.code) {
      case 'NETWORK_ERROR':
        return 'Shopify服务暂时不可用，但您的订单已安全保存';
      case 'TIMEOUT':
        return 'Shopify同步超时，将在后台继续处理';
      case 'AUTH_ERROR':
        return 'Shopify集成配置需要更新，请联系管理员';
      case 'RATE_LIMIT':
        return 'Shopify同步频率过高，将稍后重试';
      case 'SHOPIFY_API_ERROR':
        return `Shopify API错误：${errorInfo.message}`;
      default:
        return 'Shopify同步遇到问题，核心功能不受影响';
    }
  }

  /**
   * 🔄 判断错误是否可重试
   */
  private static isRetryable(errorInfo: any): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'];
    return retryableCodes.includes(errorInfo.code)
      || (errorInfo.status >= 500 && errorInfo.status < 600);
  }

  /**
   * 📢 发送告警
   */
  private static async sendAlert(operation: string, errorInfo: any): Promise<void> {
    try {
      // 🔧 这里可以集成告警系统（错误监控、Slack等）
      if (errorInfo.code === 'AUTH_ERROR' || errorInfo.status >= 500) {
        // 发送高优先级告警
        console.error(`🚨 [CRITICAL] Shopify ${operation} error:`, errorInfo);
      }
    } catch (error) {
      // 告警失败不应影响主流程
      console.warn('Failed to send Shopify error alert:', error);
    }
  }

  /**
   * 💾 记录到数据库
   */
  private static async logToDatabase(operation: string, errorInfo: any): Promise<void> {
    try {
      // 🗄️ 这里可以记录到错误日志表
      // const db = await getDB();
      // await db.insert(shopifyErrorLogsSchema).values({
      //   operation,
      //   errorCode: errorInfo.code,
      //   errorMessage: errorInfo.message,
      //   errorDetails: errorInfo.details,
      //   timestamp: new Date(),
      // });

      console.log(`[ShopifyErrorLog] ${operation}: ${errorInfo.code} - ${errorInfo.message}`);
    } catch (error) {
      // 数据库记录失败不应影响主流程
      console.warn('Failed to log Shopify error to database:', error);
    }
  }

  /**
   * 🏥 处理健康检查错误
   */
  static handleHealthCheckError(error: any): {
    status: 'degraded' | 'down';
    message: string;
    canContinue: boolean;
  } {
    const errorInfo = this.parseError(error);

    // 认证错误意味着集成配置有问题
    if (errorInfo.code === 'AUTH_ERROR') {
      return {
        status: 'down',
        message: 'Shopify认证失败，需要检查配置',
        canContinue: false,
      };
    }

    // 网络或超时错误是临时的
    if (['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'].includes(errorInfo.code)) {
      return {
        status: 'degraded',
        message: 'Shopify服务响应缓慢，但可继续使用',
        canContinue: true,
      };
    }

    return {
      status: 'degraded',
      message: errorInfo.message,
      canContinue: true,
    };
  }
}
