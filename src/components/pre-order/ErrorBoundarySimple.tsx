/**
 * 简化的错误边界组件
 * 临时版本，避免构建问题
 */

'use client';

import type { ReactNode } from 'react';
import React, { Component } from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
};

type PaymentErrorBoundaryProps = {
  children: ReactNode;
};

export class PaymentErrorBoundary extends Component<PaymentErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: PaymentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Payment error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            An error occurred while processing your payment. Please try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
