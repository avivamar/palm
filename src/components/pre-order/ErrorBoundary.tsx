/**
 * 支付流程错误边界组件
 * 提供优雅的错误处理和恢复机制
 */

'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import React, { Component } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
  isRetrying: boolean;
};

export class PaymentErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
      retryCount: 0,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error('Payment Error Boundary caught an error:', error, errorInfo);

    // Track error in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_id: this.state.errorId,
        error_boundary: 'PaymentErrorBoundary',
      });
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  private reportError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Log error locally for now - can be extended with remote reporting
      console.error('PaymentErrorBoundary caught error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
      });

      // This would integrate with your error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: error.message,
      //     stack: error.stack,
      //     componentStack: errorInfo.componentStack,
      //     errorId: this.state.errorId,
      //     timestamp: new Date().toISOString(),
      //     userAgent: navigator.userAgent,
      //     url: window.location.href,
      //   }),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState({
      isRetrying: true,
      retryCount: this.state.retryCount + 1,
    });

    // Add delay to prevent rapid retries
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorId: undefined,
        isRetrying: false,
      });
    }, 1000);
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  private getErrorType = (error?: Error): 'payment' | 'network' | 'validation' | 'unknown' => {
    if (!error) {
      return 'unknown';
    }

    const message = error.message.toLowerCase();

    if (message.includes('payment') || message.includes('stripe') || message.includes('card')) {
      return 'payment';
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }

    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation';
    }

    return 'unknown';
  };

  private getErrorMessage = (errorType: string): { title: string; description: string; canRetry: boolean } => {
    switch (errorType) {
      case 'payment':
        return {
          title: 'Payment Processing Error',
          description: 'There was an issue processing your payment. This could be due to a temporary payment system issue or invalid payment details.',
          canRetry: true,
        };

      case 'network':
        return {
          title: 'Connection Error',
          description: 'Unable to connect to our servers. Please check your internet connection and try again.',
          canRetry: true,
        };

      case 'validation':
        return {
          title: 'Form Validation Error',
          description: 'Please check your form inputs and ensure all required fields are filled correctly.',
          canRetry: false,
        };

      default:
        return {
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred. Our team has been notified and is working to fix this issue.',
          canRetry: true,
        };
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const errorMessage = this.getErrorMessage(errorType);
      const canRetry = errorMessage.canRetry && this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">{errorMessage.title}</CardTitle>
              <CardDescription>{errorMessage.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Error Details:</strong>
                    {' '}
                    {this.state.error.message}
                    {this.state.errorId && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Error ID:
                        {' '}
                        {this.state.errorId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="w-full"
                  >
                    {this.state.isRetrying
                      ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Retrying...
                          </>
                        )
                      : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again (
                            {this.maxRetries - this.state.retryCount}
                            {' '}
                            attempts left)
                          </>
                        )}
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={this.handleGoBack}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>

                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="w-full"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
              </div>

              {this.state.retryCount >= this.maxRetries && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Need help?</strong>
                    {' '}
                    If this problem persists, please contact our support team at
                    {' '}
                    <a
                      href="mailto:support@rolitt.com"
                      className="text-primary hover:underline"
                    >
                      support@rolitt.com
                    </a>
                    {' '}
                    with error ID:
                    {this.state.errorId}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 函数式错误边界 Hook（用于函数组件）
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}

// 高阶组件包装器
export function withPaymentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WrappedComponent(props: P) {
    return (
      <PaymentErrorBoundary fallback={fallback}>
        <Component {...props} />
      </PaymentErrorBoundary>
    );
  };
}
