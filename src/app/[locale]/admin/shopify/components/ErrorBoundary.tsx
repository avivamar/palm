/**
 * Error Boundary and Retry Components
 * 错误边界和重试机制 - 提供完善的错误处理和恢复功能
 */

'use client';

import type { ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronRight,
  Copy,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import React, { Component, useCallback, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Error types
type ErrorInfo = {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
};

type ErrorDetails = {
  name: string;
  message: string;
  stack?: string;
  cause?: any;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  component?: string;
};

// Error boundary state
type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
};

// Props for error boundary
type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorDetails: ErrorDetails) => void;
  maxRetries?: number;
  component?: string;
};

// Error Boundary Class Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Create detailed error information
    const errorDetails: ErrorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      component: this.props.component,
    };

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    // Send error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorDetails, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private getUserId = (): string | undefined => {
    // Get user ID from your auth system
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('userId') || undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  private getSessionId = (): string | undefined => {
    // Get session ID from your session management
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('sessionId') || undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  private sendErrorToMonitoring = (errorDetails: ErrorDetails, errorInfo: ErrorInfo) => {
    // Send to your monitoring service (error tracking, LogRocket, etc.)
    try {
      // Example: Send to a monitoring endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errorDetails,
          errorInfo,
          tags: {
            component: 'shopify-admin',
            section: this.props.component || 'unknown',
          },
        }),
      }).catch(() => {
        // Silent fail for error reporting
      });
    } catch {
      // Silent fail for error reporting
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1,
      });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry);
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo!}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          errorId={this.state.errorId!}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
type ErrorFallbackProps = {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  onReset: () => void;
  retryCount: number;
  maxRetries: number;
  errorId: string;
};

function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  onReset,
  retryCount,
  maxRetries,
  errorId,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    const errorText = `Error ID: ${errorId}\n\nError: ${error.name}\nMessage: ${error.message}\n\nStack:\n${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`;

    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      console.log('Error details:', errorText);
    }
  };

  const canRetry = retryCount < maxRetries;
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-card border border-destructive/20 rounded-lg p-6 space-y-4">
        {/* Error Icon and Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-full">
            {isNetworkError
              ? (
                  <XCircle className="h-6 w-6 text-destructive" />
                )
              : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Error ID:
              {' '}
              {errorId}
            </p>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            {isNetworkError
              ? 'Unable to connect to the server. Please check your internet connection and try again.'
              : error.message || 'An unexpected error occurred while loading this component.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {canRetry
            ? (
                <Button
                  onClick={onRetry}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                  {' '}
                  {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </Button>
              )
            : (
                <Button
                  onClick={onReset}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Component
                </Button>
              )}

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>

        {/* Error Details Toggle */}
        <div className="border-t border-border pt-4">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            className="gap-2 text-xs"
          >
            {showDetails
              ? (
                  <ChevronDown className="h-3 w-3" />
                )
              : (
                  <ChevronRight className="h-3 w-3" />
                )}
            {showDetails ? 'Hide' : 'Show'}
            {' '}
            Error Details
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Error Details</span>
                  <Button
                    onClick={handleCopyError}
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 text-foreground font-mono">{error.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Message:</span>
                    <span className="ml-2 text-foreground">{error.message}</span>
                  </div>
                  {error.stack && (
                    <div>
                      <span className="text-muted-foreground">Stack:</span>
                      <pre className="mt-1 text-xs text-foreground font-mono bg-background border border-border rounded p-2 overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bug className="h-3 w-3" />
                <span>
                  If this error persists, please contact support with the Error ID above.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children, ...props }: ErrorBoundaryProps) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Create a synthetic error for the boundary
      const error = new Error(
        event.reason?.message || 'Unhandled promise rejection',
      );
      error.stack = event.reason?.stack;

      // Trigger error boundary (this is a bit hacky but works)
      throw error;
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
}

// Retry wrapper for failed API calls
type RetryWrapperProps = {
  children: ReactNode;
  onRetry?: () => void | Promise<void>;
  maxRetries?: number;
  backoffMs?: number;
  error?: Error | null;
  isLoading?: boolean;
};

export function RetryWrapper({
  children,
  onRetry,
  maxRetries = 3,
  backoffMs = 1000,
  error,
  isLoading = false,
}: RetryWrapperProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries || !onRetry) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Add exponential backoff
      const delay = backoffMs * 2 ** retryCount;
      await new Promise(resolve => setTimeout(resolve, delay));

      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, onRetry, backoffMs]);

  // Reset retry count when error is cleared
  React.useEffect(() => {
    if (!error) {
      setRetryCount(0);
    }
  }, [error]);

  if (error && !isLoading) {
    const canRetry = retryCount < maxRetries && onRetry;
    const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
            {isNetworkError
              ? (
                  <XCircle className="h-8 w-8 text-destructive" />
                )
              : (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>

          {canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="gap-2"
            >
              {isRetrying
                ? (
                    <>
                      <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                      Retrying...
                    </>
                  )
                : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                      {' '}
                      {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                    </>
                  )}
            </Button>
          )}

          {retryCount >= maxRetries && (
            <div className="text-xs text-muted-foreground">
              Maximum retry attempts reached. Please refresh the page.
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Inline error display for smaller components
type InlineErrorProps = {
  error: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
};

export function InlineError({ error, onRetry, onDismiss, className }: InlineErrorProps) {
  if (!error) {
    return null;
  }

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={cn(
      'bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3',
      className,
    )}
    >
      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-destructive">
          {errorMessage}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        )}

        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
          >
            <XCircle className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    } else {
      setError(new Error(String(error)));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
