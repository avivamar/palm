/**
 * Validation Message Components
 * 验证信息组件 - 表单验证反馈和消息显示
 */

'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import React from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type ValidationMessageType = 'error' | 'warning' | 'success' | 'info' | 'loading';

export type ValidationMessageProps = {
  type: ValidationMessageType;
  message: string;
  details?: string[];
  onDismiss?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  actions?: React.ReactNode;
};

export function ValidationMessage({
  type,
  message,
  details,
  onDismiss,
  className,
  size = 'medium',
  showIcon = true,
  actions,
}: ValidationMessageProps) {
  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      textColor: 'text-destructive',
      iconColor: 'text-destructive',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    loading: {
      icon: Loader2,
      bgColor: 'bg-muted/50',
      borderColor: 'border-muted',
      textColor: 'text-muted-foreground',
      iconColor: 'text-muted-foreground',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  const sizeClasses = {
    small: 'p-3 text-sm',
    medium: 'p-4',
    large: 'p-6 text-base',
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
  };

  return (
    <div className={cn(
      'rounded-lg border',
      config.bgColor,
      config.borderColor,
      sizeClasses[size],
      className,
    )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <IconComponent
              className={cn(
                iconSizes[size],
                config.iconColor,
                type === 'loading' ? 'animate-spin' : '',
              )}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', config.textColor)}>
            {message}
          </p>

          {details && details.length > 0 && (
            <ul className={cn('mt-2 text-sm list-disc list-inside space-y-1', config.textColor)}>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}

          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>

        {onDismiss && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={cn('h-6 w-6 p-0', config.textColor)}
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline validation message for form fields
export type InlineValidationProps = {
  type: 'error' | 'success' | 'warning';
  message: string;
  className?: string;
};

export function InlineValidation({ type, message, className }: InlineValidationProps) {
  const typeConfig = {
    error: {
      icon: AlertCircle,
      color: 'text-destructive',
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={cn('flex items-center gap-1 mt-1', className)}>
      <IconComponent className={cn('h-3 w-3 flex-shrink-0', config.color)} />
      <p className={cn('text-xs', config.color)}>
        {message}
      </p>
    </div>
  );
}

// Form validation summary
export type ValidationSummaryProps = {
  errors: string[];
  warnings?: string[];
  onClearErrors?: () => void;
  className?: string;
  title?: string;
};

export function ValidationSummary({
  errors,
  warnings = [],
  onClearErrors,
  className,
  title = 'Please fix the following issues:',
}: ValidationSummaryProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {errors.length > 0 && (
        <ValidationMessage
          type="error"
          message={title}
          details={errors}
          onDismiss={onClearErrors}
          className="mb-4"
        />
      )}

      {warnings.length > 0 && (
        <ValidationMessage
          type="warning"
          message="Please review the following warnings:"
          details={warnings}
          className="mb-4"
        />
      )}
    </div>
  );
}

// Real-time validation indicator
export type ValidationIndicatorProps = {
  isValidating: boolean;
  isValid?: boolean;
  error?: string;
  className?: string;
};

export function ValidationIndicator({
  isValidating,
  isValid,
  error,
  className,
}: ValidationIndicatorProps) {
  if (isValidating) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Validating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <InlineValidation type="error" message={error} className={className} />
    );
  }

  if (isValid) {
    return (
      <InlineValidation type="success" message="Valid" className={className} />
    );
  }

  return null;
}

// Toast-style notification for form actions
export type FormNotificationProps = {
  type: ValidationMessageType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
  actions?: React.ReactNode;
};

export function FormNotification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
  actions,
}: FormNotificationProps) {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    // Explicit return for TypeScript when condition is false
    return undefined;
  }, [duration, onClose]);

  const typeConfig = {
    error: {
      bgColor: 'bg-destructive',
      textColor: 'text-destructive-foreground',
    },
    warning: {
      bgColor: 'bg-yellow-600',
      textColor: 'text-yellow-50',
    },
    success: {
      bgColor: 'bg-green-600',
      textColor: 'text-green-50',
    },
    info: {
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-50',
    },
    loading: {
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 w-96 rounded-lg shadow-lg border border-border',
      config.bgColor,
      className,
    )}
    >
      <div className={cn('p-4', config.textColor)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">
              {title}
            </h4>
            {message && (
              <p className="mt-1 text-sm opacity-90">
                {message}
              </p>
            )}
            {actions && (
              <div className="mt-3">
                {actions}
              </div>
            )}
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn('h-6 w-6 p-0 ml-2', config.textColor)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Progress validation for multi-step forms
export type ValidationProgressProps = {
  steps: Array<{
    name: string;
    isValid: boolean;
    errors?: string[];
  }>;
  currentStep: number;
  className?: string;
};

export function ValidationProgress({
  steps,
  currentStep,
  className,
}: ValidationProgressProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const hasErrors = step.errors && step.errors.length > 0;

        return (
          <div
            key={step.name}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              isActive ? 'border-primary bg-primary/5' : '',
              isCompleted && step.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : '',
              hasErrors ? 'border-destructive/20 bg-destructive/5' : '',
            )}
          >
            <div className={cn(
              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
              isActive ? 'bg-primary text-primary-foreground' : '',
              isCompleted && step.isValid ? 'bg-green-600 text-white' : '',
              hasErrors ? 'bg-destructive text-destructive-foreground' : '',
              !isActive && !isCompleted && !hasErrors ? 'bg-muted text-muted-foreground' : '',
            )}
            >
              {isCompleted && step.isValid
                ? (
                    <CheckCircle className="h-4 w-4" />
                  )
                : hasErrors
                  ? (
                      <AlertCircle className="h-4 w-4" />
                    )
                  : (
                      index + 1
                    )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                isActive ? 'text-primary' : '',
                isCompleted && step.isValid ? 'text-green-800 dark:text-green-200' : '',
                hasErrors ? 'text-destructive' : '',
              )}
              >
                {step.name}
              </p>

              {hasErrors && (
                <p className="text-xs text-destructive mt-1">
                  {step.errors?.length}
                  {' '}
                  error
                  {step.errors?.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
