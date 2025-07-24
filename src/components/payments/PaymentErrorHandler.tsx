'use client';

import { AlertTriangle, Clock, CreditCard, RefreshCw, Wifi } from 'lucide-react';
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentError } from '@/libs/payments/core/payment-errors';

type PaymentErrorType
  = | 'card_declined'
    | 'insufficient_funds'
    | 'expired_card'
    | 'incorrect_cvc'
    | 'processing_error'
    | 'network_error'
    | 'authentication_required'
    | 'rate_limit_error'
    | 'generic_error';

type PaymentErrorHandlerProps = {
  error: PaymentError | Error | null;
  onRetry?: () => void;
  onCancel?: () => void;
  retryCount?: number;
  maxRetries?: number;
  autoRetryEnabled?: boolean;
  className?: string;
};

type ErrorConfig = {
  title: string;
  description: string;
  icon: React.ReactNode;
  severity: 'error' | 'warning' | 'info';
  canRetry: boolean;
  autoRetryDelay?: number;
  suggestions: string[];
};

const ERROR_CONFIGS: Record<PaymentErrorType, ErrorConfig> = {
  card_declined: {
    title: 'Card Declined',
    description: 'Your card was declined by your bank.',
    icon: <CreditCard className="h-4 w-4" />,
    severity: 'error',
    canRetry: true,
    suggestions: [
      'Check your card details are correct',
      'Ensure you have sufficient funds',
      'Contact your bank if the issue persists',
      'Try a different payment method',
    ],
  },
  insufficient_funds: {
    title: 'Insufficient Funds',
    description: 'Your account does not have enough funds for this transaction.',
    icon: <CreditCard className="h-4 w-4" />,
    severity: 'error',
    canRetry: true,
    suggestions: [
      'Add funds to your account',
      'Try a different payment method',
      'Contact your bank for assistance',
    ],
  },
  expired_card: {
    title: 'Card Expired',
    description: 'The card you are trying to use has expired.',
    icon: <Clock className="h-4 w-4" />,
    severity: 'error',
    canRetry: false,
    suggestions: [
      'Update your card information',
      'Use a different payment method',
      'Contact your bank for a new card',
    ],
  },
  incorrect_cvc: {
    title: 'Incorrect Security Code',
    description: 'The security code (CVC) you entered is incorrect.',
    icon: <CreditCard className="h-4 w-4" />,
    severity: 'error',
    canRetry: true,
    suggestions: [
      'Check the 3-digit code on the back of your card',
      'For American Express, use the 4-digit code on the front',
      'Ensure you are entering the correct card details',
    ],
  },
  processing_error: {
    title: 'Processing Error',
    description: 'There was an error processing your payment.',
    icon: <AlertTriangle className="h-4 w-4" />,
    severity: 'error',
    canRetry: true,
    autoRetryDelay: 3000,
    suggestions: [
      'Please try again in a few moments',
      'Check your internet connection',
      'Contact support if the issue persists',
    ],
  },
  network_error: {
    title: 'Connection Error',
    description: 'Unable to connect to payment services.',
    icon: <Wifi className="h-4 w-4" />,
    severity: 'warning',
    canRetry: true,
    autoRetryDelay: 2000,
    suggestions: [
      'Check your internet connection',
      'Try again in a few moments',
      'Refresh the page if the problem continues',
    ],
  },
  authentication_required: {
    title: 'Authentication Required',
    description: 'Your bank requires additional authentication for this payment.',
    icon: <CreditCard className="h-4 w-4" />,
    severity: 'info',
    canRetry: true,
    suggestions: [
      'Complete the authentication with your bank',
      'Check for SMS or app notifications',
      'Contact your bank if you need assistance',
    ],
  },
  rate_limit_error: {
    title: 'Too Many Attempts',
    description: 'Too many payment attempts. Please wait before trying again.',
    icon: <Clock className="h-4 w-4" />,
    severity: 'warning',
    canRetry: true,
    autoRetryDelay: 30000,
    suggestions: [
      'Wait a few minutes before trying again',
      'Ensure your payment details are correct',
      'Contact support if you need immediate assistance',
    ],
  },
  generic_error: {
    title: 'Payment Error',
    description: 'An unexpected error occurred during payment processing.',
    icon: <AlertTriangle className="h-4 w-4" />,
    severity: 'error',
    canRetry: true,
    suggestions: [
      'Please try again',
      'Check your payment details',
      'Contact support if the issue persists',
    ],
  },
};

function classifyError(error: PaymentError | Error): PaymentErrorType {
  if (error instanceof PaymentError) {
    const message = error.message.toLowerCase();

    if (message.includes('card_declined') || message.includes('declined')) {
      return 'card_declined';
    }
    if (message.includes('insufficient_funds') || message.includes('insufficient')) {
      return 'insufficient_funds';
    }
    if (message.includes('expired_card') || message.includes('expired')) {
      return 'expired_card';
    }
    if (message.includes('incorrect_cvc') || message.includes('cvc')) {
      return 'incorrect_cvc';
    }
    if (message.includes('authentication_required') || message.includes('3d_secure')) {
      return 'authentication_required';
    }
    if (message.includes('rate_limit') || message.includes('too_many')) {
      return 'rate_limit_error';
    }
  }

  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('connection')) {
    return 'network_error';
  }
  if (message.includes('processing')) {
    return 'processing_error';
  }

  return 'generic_error';
}

export function PaymentErrorHandler({
  error,
  onRetry,
  onCancel,
  retryCount = 0,
  maxRetries = 3,
  autoRetryEnabled = false,
  className = '',
}: PaymentErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  if (!error) {
    return null;
  }

  const errorType = classifyError(error);
  const config = ERROR_CONFIGS[errorType];
  const canRetry = config.canRetry && retryCount < maxRetries && onRetry;

  // Auto-retry logic
  React.useEffect(() => {
    if (autoRetryEnabled && config.autoRetryDelay && canRetry && retryCount === 0) {
      const delay = config.autoRetryDelay;
      setAutoRetryCountdown(Math.ceil(delay / 1000));

      const countdownInterval = setInterval(() => {
        setAutoRetryCountdown((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          }
          clearInterval(countdownInterval);
          return null;
        });
      }, 1000);

      const retryTimeout = setTimeout(() => {
        setAutoRetryCountdown(null);
        handleRetry();
      }, delay);

      return () => {
        clearTimeout(retryTimeout);
        clearInterval(countdownInterval);
      };
    }
    return () => {};
  }, [error, autoRetryEnabled, config.autoRetryDelay, canRetry, retryCount]);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) {
      return;
    }

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className={`border-l-4 ${config.severity === 'error' ? 'border-l-red-500' : config.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {config.icon}
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
          <Badge variant={getSeverityColor(config.severity)}>
            {config.severity.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Details */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>What happened?</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message}
          </AlertDescription>
        </Alert>

        {/* Suggestions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">What you can do:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Retry Information */}
        {retryCount > 0 && (
          <div className="text-sm text-muted-foreground">
            Attempt
            {' '}
            {retryCount}
            {' '}
            of
            {' '}
            {maxRetries}
          </div>
        )}

        {/* Auto-retry countdown */}
        {autoRetryCountdown && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>
              Auto-retry in
              {autoRetryCountdown}
              {' '}
              seconds
            </AlertTitle>
            <AlertDescription>
              We'll automatically try again, or you can retry manually.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying || !!autoRetryCountdown}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>
                {isRetrying ? 'Retrying...' : autoRetryCountdown ? `Retry in ${autoRetryCountdown}s` : 'Try Again'}
              </span>
            </Button>
          )}

          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentErrorHandler;
