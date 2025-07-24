/**
 * Global Error Handler
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

'use client';

import type { ErrorInfo } from '@/components/ErrorBoundary';
import React from 'react';

type GlobalErrorConfig = {
  enableConsoleReporting: boolean;
  enableRemoteReporting: boolean;
  maxErrorsPerSession: number;
  rateLimitWindow: number; // milliseconds
};

const DEFAULT_CONFIG: GlobalErrorConfig = {
  enableConsoleReporting: true,
  enableRemoteReporting: process.env.NODE_ENV === 'production',
  maxErrorsPerSession: 50,
  rateLimitWindow: 60000, // 1 minute
};

class GlobalErrorHandler {
  private config: GlobalErrorConfig;
  private errorCount: number = 0;
  private errorHistory: Map<string, number> = new Map();
  private lastReportTime: number = 0;

  constructor(config: Partial<GlobalErrorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);

    // Handle JavaScript errors
    window.addEventListener('error', this.handleGlobalError);

    // Handle resource loading errors
    window.addEventListener('error', this.handleResourceError, true);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    this.reportError({
      error,
      timestamp: new Date(),
      userAgent: window.navigator.userAgent,
      url: window.location.href,
    }, {
      type: 'unhandled_promise_rejection',
      reason: event.reason,
    });

    // Prevent the default unhandled rejection behavior
    event.preventDefault();
  };

  private handleGlobalError = (event: ErrorEvent): void => {
    const error = event.error || new Error(event.message);

    this.reportError({
      error,
      timestamp: new Date(),
      userAgent: window.navigator.userAgent,
      url: window.location.href,
    }, {
      type: 'javascript_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  private handleResourceError = (event: Event): void => {
    const target = event.target as HTMLElement;

    if (target && target.tagName) {
      const error = new Error(`Resource failed to load: ${target.tagName}`);

      this.reportError({
        error,
        timestamp: new Date(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
      }, {
        type: 'resource_error',
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
      });
    }
  };

  private shouldReportError(errorKey: string): boolean {
    const now = Date.now();

    // Check rate limiting
    if (now - this.lastReportTime < this.config.rateLimitWindow) {
      const recentErrors = this.errorHistory.get(errorKey) || 0;
      if (recentErrors >= 5) {
        return false; // Too many similar errors in short time
      }
    }

    // Check session limit
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      return false;
    }

    return true;
  }

  private generateErrorKey(errorInfo: ErrorInfo): string {
    return `${errorInfo.error.name}:${errorInfo.error.message.slice(0, 50)}`;
  }

  public reportError(errorInfo: ErrorInfo, additionalData?: Record<string, any>): void {
    const errorKey = this.generateErrorKey(errorInfo);

    if (!this.shouldReportError(errorKey)) {
      return;
    }

    // Update counters
    this.errorCount++;
    this.errorHistory.set(errorKey, (this.errorHistory.get(errorKey) || 0) + 1);
    this.lastReportTime = Date.now();

    // Console reporting
    if (this.config.enableConsoleReporting) {
      console.error('Global Error Handler:', {
        errorKey,
        errorInfo,
        additionalData,
        errorCount: this.errorCount,
      });
    }

    // Remote reporting
    if (this.config.enableRemoteReporting) {
      this.sendToRemoteService(errorInfo, additionalData);
    }
  }

  private async sendToRemoteService(errorInfo: ErrorInfo, additionalData?: Record<string, any>): Promise<void> {
    try {
      // This would be replaced with your actual error reporting service
      // Examples: error tracking, LogRocket, Bugsnag, custom endpoint

      const payload = {
        error: {
          name: errorInfo.error.name,
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
        },
        metadata: {
          timestamp: errorInfo.timestamp.toISOString(),
          url: errorInfo.url,
          userAgent: errorInfo.userAgent,
          userId: errorInfo.userId,
          ...additionalData,
        },
        session: {
          errorCount: this.errorCount,
          sessionId: this.getSessionId(),
        },
      };

      // Example API call (replace with your service)
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
    } catch (reportingError) {
      console.error('Failed to send error to remote service:', reportingError);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('error_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_session_id', sessionId);
    }
    return sessionId;
  }

  public getErrorStats(): {
    totalErrors: number;
    errorTypes: Record<string, number>;
    sessionId: string;
  } {
    return {
      totalErrors: this.errorCount,
      errorTypes: Object.fromEntries(this.errorHistory),
      sessionId: this.getSessionId(),
    };
  }

  public clearErrorHistory(): void {
    this.errorCount = 0;
    this.errorHistory.clear();
    sessionStorage.removeItem('error_session_id');
  }

  public cleanup(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('error', this.handleResourceError, true);
  }
}

// Create singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// React hook for error stats
export function useErrorStats() {
  const [stats, setStats] = React.useState(globalErrorHandler.getErrorStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalErrorHandler.getErrorStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Export types and utilities
export type { GlobalErrorConfig };
export { GlobalErrorHandler };

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__globalErrorHandler = globalErrorHandler;
}
