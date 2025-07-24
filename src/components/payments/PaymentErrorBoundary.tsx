'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

// 定义错误边界组件的属性类型
type PaymentErrorBoundaryProps = {
  children: React.ReactNode;
};

// 定义错误边界组件的状态类型
type PaymentErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class PaymentErrorBoundary extends React.Component<PaymentErrorBoundaryProps, PaymentErrorBoundaryState> {
  constructor(props: PaymentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PaymentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment Error Boundary caught an error:', error, errorInfo);

    // 可以在这里添加错误报告逻辑
    // 例如发送到错误监控或其他错误监控服务
  }

  render() {
    if (this.state.hasError) {
      return <PaymentErrorFallback error={this.state.error!} reset={() => this.setState({ hasError: false, error: undefined })} />;
    }

    return this.props.children;
  }
}

// 错误回退显示组件
function PaymentErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  // 判断是否为配置相关错误
  const isConfigurationError = error.message.includes('STRIPE_SECRET_KEY')
    || error.message.includes('COLOR_PRICE_MAP_JSON')
    || error.message.includes('environment variable');

  // 判断是否为网络相关错误
  const isNetworkError = error.message.includes('network')
    || error.message.includes('fetch')
    || error.message.includes('connection');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-lg border border-red-200">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-red-700 mb-4">
          {isConfigurationError ? 'Configuration Error' : 'Payment System Error'}
        </h2>

        <p className="text-gray-700 mb-6">
          {isConfigurationError
            ? 'The payment system configuration is incomplete. Please contact technical support.'
            : isNetworkError
              ? 'Network connection issues detected. Please check your connection and try again.'
              : 'The payment system is temporarily unavailable. Please try again later or contact customer service.'}
        </p>

        <div className="space-y-4">
          <Button
            onClick={reset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>

          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh Page
          </Button>

          {!isConfigurationError && (
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/contact'}
              className="w-full"
            >
              Contact Support
            </Button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development Only)
            </summary>
            <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              <div className="font-semibold text-red-600 mb-2">Error Message:</div>
              <div className="mb-4">{error.message}</div>

              {error.stack && (
                <>
                  <div className="font-semibold text-red-600 mb-2">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default PaymentErrorBoundary;
