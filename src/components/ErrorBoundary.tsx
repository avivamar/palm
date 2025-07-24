/**
 * Enhanced Error Boundary Component
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

'use client';

import { AlertTriangle, Home, MessageCircle, RefreshCw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

type ErrorInfo = {
  error: Error;
  errorInfo?: React.ErrorInfo;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void; errorInfo: ErrorInfo }>;
  onError?: (errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  name?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo: ErrorInfo = {
      error,
      errorInfo,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userId: this.getUserId(),
    };

    // Log error details
    console.error('ErrorBoundary caught an error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      level: this.props.level || 'component',
      timestamp: enhancedErrorInfo.timestamp.toISOString(),
      errorId: this.state.errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(enhancedErrorInfo);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Report to monitoring service (implement based on your monitoring setup)
    this.reportError(enhancedErrorInfo);

    this.setState({ errorInfo });
  }

  private getUserId(): string | undefined {
    try {
      // Try to get user ID from localStorage or session
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.id || parsed.email;
        }
      }
    } catch {
      // Ignore errors in getting user ID
    }
    return undefined;
  }

  private reportError(errorInfo: ErrorInfo): void {
    try {
      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
    // errorTracker.captureException(errorInfo.error, {
        //   tags: {
        //     errorBoundary: this.props.name || 'Unknown',
        //     level: this.props.level || 'component',
        //   },
        //   extra: errorInfo,
        // });

        // For now, just log to console in production
        console.error('Production error captured:', {
          errorId: this.state.errorId,
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
          timestamp: errorInfo.timestamp.toISOString(),
          level: this.props.level,
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleReset = (): void => {
    this.retryCount++;

    if (this.retryCount <= this.maxRetries) {
      console.log(`ErrorBoundary retry ${this.retryCount}/${this.maxRetries}`);
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined,
      });
    } else {
      console.error('ErrorBoundary max retries reached, redirecting to home');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || this.getDefaultErrorFallback();
      const enhancedErrorInfo: ErrorInfo = {
        error: this.state.error!,
        errorInfo: this.state.errorInfo,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userId: this.getUserId(),
      };

      return (
        <FallbackComponent
          error={this.state.error!}
          reset={this.handleReset}
          errorInfo={enhancedErrorInfo}
        />
      );
    }

    return this.props.children;
  }

  private getDefaultErrorFallback() {
    const level = this.props.level || 'component';

    switch (level) {
      case 'critical':
        return CriticalErrorFallback;
      case 'page':
        return PageErrorFallback;
      default:
        return ComponentErrorFallback;
    }
  }
}

// Critical Error Fallback (for app-level errors)
function CriticalErrorFallback({ error, reset: _, errorInfo }: {
  error: Error;
  reset: () => void;
  errorInfo: ErrorInfo;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Critical Error</h1>
        <p className="text-muted-foreground mb-6">
          A critical error has occurred. The application needs to be restarted.
        </p>
        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Application
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </Button>
        </div>
        <ErrorDetails error={error} errorInfo={errorInfo} />
      </div>
    </div>
  );
}

// Page Error Fallback (for page-level errors)
function PageErrorFallback({ error, reset, errorInfo }: {
  error: Error;
  reset: () => void;
  errorInfo: ErrorInfo;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-4">Page Error</h2>
        <p className="text-muted-foreground mb-6">
          This page encountered an error and couldn't load properly.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button onClick={reset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <ErrorDetails error={error} errorInfo={errorInfo} />
      </div>
    </div>
  );
}

// Component Error Fallback (for component-level errors)
function ComponentErrorFallback({ error, reset, errorInfo }: {
  error: Error;
  reset: () => void;
  errorInfo: ErrorInfo;
}) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 my-4">
      <div className="flex items-center mb-3">
        <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
        <h3 className="text-lg font-semibold text-destructive">Component Error</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        A component failed to render properly. You can try to reload it or continue using other parts of the application.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const errorId = errorInfo.error.message.slice(0, 8);
            const subject = encodeURIComponent(`Component Error - ${errorId}`);
            window.open(`mailto:support@rolitt.com?subject=${subject}`);
          }}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Report
        </Button>
      </div>
      <ErrorDetails error={error} errorInfo={errorInfo} compact />
    </div>
  );
}

// Error Details Component
function ErrorDetails({
  error,
  errorInfo,
  compact = false,
}: {
  error: Error;
  errorInfo: ErrorInfo;
  compact?: boolean;
}) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <details className={`${compact ? 'mt-3' : 'mt-6'} text-left`}>
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        Error Details (Development Only)
      </summary>
      <div className={`mt-2 p-3 bg-muted rounded text-xs overflow-auto ${compact ? 'max-h-32' : 'max-h-48'}`}>
        <div className="space-y-2">
          <div>
            <strong>Error:</strong>
            {' '}
            {error.message}
          </div>
          <div>
            <strong>Time:</strong>
            {' '}
            {errorInfo.timestamp.toISOString()}
          </div>
          <div>
            <strong>URL:</strong>
            {' '}
            {errorInfo.url}
          </div>
          {errorInfo.userId && (
            <div>
              <strong>User:</strong>
              {' '}
              {errorInfo.userId}
            </div>
          )}
          {error.stack && (
            <div>
              <strong>Stack:</strong>
              <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
            </div>
          )}
          {errorInfo.errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="mt-1 whitespace-pre-wrap text-xs">
                {errorInfo.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

// Export both the main ErrorBoundary and specific fallback components
export default ErrorBoundary;

export {
  ComponentErrorFallback,
  CriticalErrorFallback,
  type ErrorBoundaryProps,
  type ErrorInfo,
  PageErrorFallback,
};

// Convenience wrappers for different error boundary levels
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    name?: string;
    level?: 'page' | 'component' | 'critical';
    onError?: (errorInfo: ErrorInfo) => void;
  },
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary
      name={options?.name || Component.displayName || Component.name}
      level={options?.level || 'component'}
      onError={options?.onError}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manually reporting errors
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, additionalInfo?: Record<string, any>) => {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    };

    console.error('Manual error report:', {
      ...errorInfo,
      ...additionalInfo,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Implementation depends on your error tracking service
    }
  }, []);

  return { reportError };
}
