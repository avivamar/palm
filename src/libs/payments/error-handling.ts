/**
 * 分层错误处理策略
 * 提供用户友好的错误恢复和完整的错误日志记录
 */

// Error categories for different handling strategies
export enum ErrorCategory {
  NETWORK = 'network',
  PAYMENT = 'payment',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Standardized error structure
export type PaymentError = {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
  userActions?: string[];
  context?: {
    userId?: string;
    sessionId?: string;
    priceId?: string;
    email?: string;
    locale?: string;
    userAgent?: string;
    url?: string;
  };
};

// Error recovery strategies
export type RecoveryStrategy = {
  canRecover: boolean;
  automaticRetry: boolean;
  userAction: boolean;
  fallbackOptions: string[];
  estimatedRecoveryTime?: number; // in seconds
};

// Error handler configuration
type ErrorHandlerConfig = {
  enableLogging: boolean;
  enableAnalytics: boolean;
  enableUserFeedback: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
};

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableLogging: true,
  enableAnalytics: true,
  enableUserFeedback: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
};

/**
 * Main error handler class with layered error processing
 */
export class PaymentErrorHandler {
  private config: ErrorHandlerConfig;
  private errorHistory: Map<string, PaymentError[]> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Categorize error based on message and type
   */
  private categorizeError(error: Error | string): ErrorCategory {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      return ErrorCategory.NETWORK;
    }

    if (lowerMessage.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }

    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return ErrorCategory.RATE_LIMIT;
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('stripe') || lowerMessage.includes('card')) {
      return ErrorCategory.PAYMENT;
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return ErrorCategory.VALIDATION;
    }

    if (lowerMessage.includes('server error') || lowerMessage.includes('internal error')) {
      return ErrorCategory.SERVER;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(category: ErrorCategory, error: Error | string): ErrorSeverity {
    const message = typeof error === 'string' ? error : error.message;

    switch (category) {
      case ErrorCategory.PAYMENT:
        return message.toLowerCase().includes('fraud') ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;

      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return ErrorSeverity.MEDIUM;

      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW;

      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.MEDIUM;

      case ErrorCategory.SERVER:
        return ErrorSeverity.HIGH;

      case ErrorCategory.CLIENT:
        return ErrorSeverity.LOW;

      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Generate user-friendly error messages
   */
  private generateUserMessage(category: ErrorCategory, locale: string = 'en'): string {
    const messages: Record<ErrorCategory, Record<string, string>> = {
      [ErrorCategory.NETWORK]: {
        'en': 'Connection issue detected. Please check your internet connection and try again.',
        'es': 'Se detectó un problema de conexión. Verifique su conexión a internet e inténtelo de nuevo.',
        'ja': '接続の問題が検出されました。インターネット接続を確認してもう一度お試しください。',
        'zh-HK': '檢測到連接問題。請檢查您的網絡連接並重試。',
      },
      [ErrorCategory.PAYMENT]: {
        'en': 'Payment processing failed. Please verify your payment details or try a different payment method.',
        'es': 'Error en el procesamiento del pago. Verifique sus datos de pago o pruebe con otro método de pago.',
        'ja': '支払い処理に失敗しました。支払い詳細を確認するか、別の支払い方法をお試しください。',
        'zh-HK': '付款處理失敗。請驗證您的付款詳細信息或嘗試其他付款方式。',
      },
      [ErrorCategory.TIMEOUT]: {
        'en': 'Request timed out. The service is taking longer than expected. Please try again.',
        'es': 'Se agotó el tiempo de espera. El servicio está tardando más de lo esperado. Inténtelo de nuevo.',
        'ja': 'リクエストがタイムアウトしました。サービスの応答に時間がかかっています。もう一度お試しください。',
        'zh-HK': '請求超時。服務響應時間比預期長。請重試。',
      },
      [ErrorCategory.VALIDATION]: {
        'en': 'Please check your form inputs and ensure all required fields are completed correctly.',
        'es': 'Verifique los datos del formulario y asegúrese de que todos los campos requeridos estén completados correctamente.',
        'ja': 'フォームの入力を確認し、必須項目がすべて正しく入力されていることを確認してください。',
        'zh-HK': '請檢查表格輸入並確保所有必填字段都正確填寫。',
      },
      [ErrorCategory.RATE_LIMIT]: {
        'en': 'Too many requests. Please wait a moment and try again.',
        'es': 'Demasiadas solicitudes. Espere un momento e inténtelo de nuevo.',
        'ja': 'リクエストが多すぎます。しばらくお待ちいただいてからもう一度お試しください。',
        'zh-HK': '請求過多。請稍等片刻後重試。',
      },
      [ErrorCategory.SERVER]: {
        'en': 'A server error occurred. Our team has been notified and is working to resolve this issue.',
        'es': 'Ocurrió un error del servidor. Nuestro equipo ha sido notificado y está trabajando para resolver este problema.',
        'ja': 'サーバーエラーが発生しました。チームに通知され、問題解決に取り組んでいます。',
        'zh-HK': '發生伺服器錯誤。我們的團隊已收到通知並正在努力解決此問題。',
      },
      [ErrorCategory.CLIENT]: {
        'en': 'An unexpected error occurred. Please refresh the page and try again.',
        'es': 'Ocurrió un error inesperado. Actualice la página e inténtelo de nuevo.',
        'ja': '予期しないエラーが発生しました。ページを更新してもう一度お試しください。',
        'zh-HK': '發生意外錯誤。請刷新頁面並重試。',
      },
      [ErrorCategory.UNKNOWN]: {
        'en': 'An unexpected error occurred. If this continues, please contact our support team.',
        'es': 'Ocurrió un error inesperado. Si esto continúa, contacte a nuestro equipo de soporte.',
        'ja': '予期しないエラーが発生しました。これが続く場合は、サポートチームにお問い合わせください。',
        'zh-HK': '發生意外錯誤。如果持續發生，請聯繫我們的支援團隊。',
      },
    };

    return messages[category]?.[locale] || messages[category]?.en || 'An error occurred. Please try again.';
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(category: ErrorCategory): boolean {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
      case ErrorCategory.RATE_LIMIT:
      case ErrorCategory.SERVER:
        return true;

      case ErrorCategory.VALIDATION:
      case ErrorCategory.CLIENT:
        return false;

      case ErrorCategory.PAYMENT:
        return false; // Usually requires user intervention

      default:
        return true; // Conservative approach
    }
  }

  /**
   * Generate recovery strategy
   */
  private generateRecoveryStrategy(category: ErrorCategory): RecoveryStrategy {
    switch (category) {
      case ErrorCategory.NETWORK:
        return {
          canRecover: true,
          automaticRetry: true,
          userAction: true,
          fallbackOptions: ['Check internet connection', 'Try again', 'Contact support'],
          estimatedRecoveryTime: 30,
        };

      case ErrorCategory.TIMEOUT:
        return {
          canRecover: true,
          automaticRetry: true,
          userAction: true,
          fallbackOptions: ['Wait and retry', 'Refresh page', 'Try different browser'],
          estimatedRecoveryTime: 15,
        };

      case ErrorCategory.PAYMENT:
        return {
          canRecover: true,
          automaticRetry: false,
          userAction: true,
          fallbackOptions: ['Check payment details', 'Try different card', 'Contact bank', 'Contact support'],
          estimatedRecoveryTime: 60,
        };

      case ErrorCategory.VALIDATION:
        return {
          canRecover: true,
          automaticRetry: false,
          userAction: true,
          fallbackOptions: ['Fix form errors', 'Check required fields'],
          estimatedRecoveryTime: 30,
        };

      case ErrorCategory.RATE_LIMIT:
        return {
          canRecover: true,
          automaticRetry: true,
          userAction: false,
          fallbackOptions: ['Wait and retry automatically'],
          estimatedRecoveryTime: 60,
        };

      default:
        return {
          canRecover: true,
          automaticRetry: false,
          userAction: true,
          fallbackOptions: ['Try again', 'Refresh page', 'Contact support'],
          estimatedRecoveryTime: 30,
        };
    }
  }

  /**
   * Process and handle an error
   */
  public async handleError(
    error: Error | string,
    context?: Partial<PaymentError['context']>,
    locale: string = 'en',
  ): Promise<{ paymentError: PaymentError; recovery: RecoveryStrategy }> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(category, error);
    const userMessage = this.generateUserMessage(category, locale);
    const retryable = this.isRetryable(category);

    const paymentError: PaymentError = {
      id: errorId,
      category,
      severity,
      message: typeof error === 'string' ? error : error.message,
      userMessage,
      code: typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
      timestamp: new Date(),
      retryable,
      context: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...context,
      },
    };

    const recovery = this.generateRecoveryStrategy(category);

    // Store error in history
    const sessionErrors = this.errorHistory.get(context?.sessionId || 'global') || [];
    sessionErrors.push(paymentError);
    this.errorHistory.set(context?.sessionId || 'global', sessionErrors);

    // Log error
    if (this.config.enableLogging) {
      await this.logError(paymentError);
    }

    // Track in analytics
    if (this.config.enableAnalytics) {
      await this.trackError(paymentError);
    }

    return { paymentError, recovery };
  }

  /**
   * Log error to console and external services
   */
  private async logError(error: PaymentError): Promise<void> {
    // Console logging with structured format
    console.group(`[PaymentError] ${error.category.toUpperCase()} - ${error.severity.toUpperCase()}`);
    console.error('Error ID:', error.id);
    console.error('Message:', error.message);
    console.error('User Message:', error.userMessage);
    console.error('Context:', error.context);
    console.error('Timestamp:', error.timestamp.toISOString());
    console.groupEnd();

    // Send to monitoring service
    try {
      // This would integrate with your monitoring service (e.g., error tracking, LogRocket)
      // await fetch('/api/errors/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // });
    } catch (logError) {
      console.warn('[PaymentErrorHandler] Failed to log error externally:', logError);
    }
  }

  /**
   * Track error in analytics
   */
  private async trackError(error: PaymentError): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'payment_error', {
          error_id: error.id,
          error_category: error.category,
          error_severity: error.severity,
          error_code: error.code,
          user_id: error.context?.userId,
          session_id: error.context?.sessionId,
          retryable: error.retryable,
        });
      }
    } catch (trackError) {
      console.warn('[PaymentErrorHandler] Failed to track error:', trackError);
    }
  }

  /**
   * Get error statistics for a session
   */
  public getErrorStats(sessionId?: string): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    retryableErrors: number;
  } {
    const errors = this.errorHistory.get(sessionId || 'global') || [];

    const stats = {
      totalErrors: errors.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      retryableErrors: errors.filter(e => e.retryable).length,
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach((category) => {
      stats.errorsByCategory[category] = 0;
    });

    Object.values(ErrorSeverity).forEach((severity) => {
      stats.errorsBySeverity[severity] = 0;
    });

    // Count errors
    errors.forEach((error) => {
      stats.errorsByCategory[error.category]++;
      stats.errorsBySeverity[error.severity]++;
    });

    return stats;
  }

  /**
   * Clear error history for a session
   */
  public clearErrorHistory(sessionId?: string): void {
    if (sessionId) {
      this.errorHistory.delete(sessionId);
    } else {
      this.errorHistory.clear();
    }
  }
}

// Singleton instance
export const paymentErrorHandler = new PaymentErrorHandler();

// Convenience functions for common error handling scenarios
export async function handleCheckoutError(
  error: Error | string,
  context?: {
    userId?: string;
    email?: string;
    priceId?: string;
    locale?: string;
  },
) {
  return paymentErrorHandler.handleError(error, context, context?.locale);
}

export async function handlePaymentError(
  error: Error | string,
  context?: {
    sessionId?: string;
    userId?: string;
    locale?: string;
  },
) {
  return paymentErrorHandler.handleError(error, context, context?.locale);
}

export async function handleValidationError(
  error: Error | string,
  context?: {
    fieldName?: string;
    value?: string;
    locale?: string;
  },
) {
  return paymentErrorHandler.handleError(error, context, context?.locale);
}
