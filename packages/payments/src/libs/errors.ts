// 支付系统错误处理
// Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"

import Stripe from 'stripe';

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class WebhookValidationError extends PaymentError {
  constructor(message: string, originalError?: any) {
    super(message, 'WEBHOOK_VALIDATION_FAILED', undefined, originalError);
    this.name = 'WebhookValidationError';
  }
}

export class PaymentIntentError extends PaymentError {
  constructor(message: string, provider: string, originalError?: any) {
    super(message, 'PAYMENT_INTENT_FAILED', provider, originalError);
    this.name = 'PaymentIntentError';
  }
}

export class CustomerError extends PaymentError {
  constructor(message: string, provider: string, originalError?: any) {
    super(message, 'CUSTOMER_ERROR', provider, originalError);
    this.name = 'CustomerError';
  }
}

export class SubscriptionError extends PaymentError {
  constructor(message: string, provider: string, originalError?: any) {
    super(message, 'SUBSCRIPTION_ERROR', provider, originalError);
    this.name = 'SubscriptionError';
  }
}

// 错误处理工具函数
export function handlePaymentError(error: unknown): PaymentError {
  if (error instanceof PaymentError) {
    return error;
  }

  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case 'StripeCardError':
        // Enhanced card error classification
        const cardErrorCode = error.code;
        let enhancedMessage = error.message;

        switch (cardErrorCode) {
          case 'card_declined':
            enhancedMessage = 'Your card was declined. Please check your card details or try a different payment method.';
            break;
          case 'insufficient_funds':
            enhancedMessage = 'Insufficient funds. Please ensure your account has enough balance or use a different card.';
            break;
          case 'expired_card':
            enhancedMessage = 'Your card has expired. Please update your card information.';
            break;
          case 'incorrect_cvc':
            enhancedMessage = 'The security code (CVC) is incorrect. Please check the code on your card.';
            break;
          case 'processing_error':
            enhancedMessage = 'Payment processing error. Please try again in a few moments.';
            break;
          case 'authentication_required':
            enhancedMessage = 'Additional authentication required. Please complete the verification with your bank.';
            break;
        }

        return new PaymentIntentError(
          enhancedMessage,
          cardErrorCode || 'card_error',
          {
            stripeError: error,
            canRetry: ['card_declined', 'processing_error', 'authentication_required'].includes(cardErrorCode || ''),
            retryDelay: cardErrorCode === 'processing_error' ? 3000 : undefined,
          },
        );
      case 'StripeRateLimitError':
        return new PaymentError(
          'Too many payment attempts. Please wait a moment before trying again.',
          'rate_limit_error',
          'stripe',
          {
            stripeError: error,
            canRetry: true,
            retryDelay: 30000,
          },
        );
      case 'StripeInvalidRequestError':
        return new PaymentError(
          `Invalid payment request: ${error.message}`,
          'invalid_request',
          'stripe',
          {
            stripeError: error,
            canRetry: false,
          },
        );
      case 'StripeAPIError':
        return new PaymentError(
          'Payment service temporarily unavailable. Please try again.',
          'api_error',
          'stripe',
          {
            stripeError: error,
            canRetry: true,
            retryDelay: 5000,
          },
        );
      case 'StripeConnectionError':
        return new PaymentError(
          'Network connection error. Please check your internet connection and try again.',
          'connection_error',
          'stripe',
          {
            stripeError: error,
            canRetry: true,
            retryDelay: 2000,
          },
        );
      case 'StripeAuthenticationError':
        return new PaymentError(
          'Payment authentication failed. Please contact support.',
          'authentication_error',
          'stripe',
          {
            stripeError: error,
            canRetry: false,
          },
        );
      default:
        return new PaymentError(
          `Payment error: ${error.message}`,
          'stripe_error',
          'stripe',
          {
            stripeError: error,
            canRetry: true,
          },
        );
    }
  }

  if (error instanceof Error) {
    return new PaymentError(
      error.message,
      'unknown_error',
      'unknown',
      {
        originalError: error,
        canRetry: true,
      },
    );
  }

  return new PaymentError(
    'An unknown payment error occurred. Please try again.',
    'unknown_error',
    'unknown',
    {
      originalError: error,
      canRetry: true,
    },
  );
}
