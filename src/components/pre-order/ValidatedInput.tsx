/**
 * 实时表单验证组件
 * 提供实时验证和用户友好的错误提示
 */

'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  isValidating?: boolean;
};

type ValidatedInputProps = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rules?: ValidationRule;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  asyncValidation?: (value: string) => Promise<string | null>;
  debounceMs?: number;
};

export function ValidatedInput({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  rules,
  disabled = false,
  required = false,
  className,
  asyncValidation,
  debounceMs = 500,
}: ValidatedInputProps) {
  const t = useTranslations('validation');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isTouched, setIsTouched] = useState(false);
  const [asyncValidationTimeout, setAsyncValidationTimeout] = useState<NodeJS.Timeout>();

  // 基础验证函数
  const validateValue = useCallback((val: string): ValidationResult => {
    if (!rules) {
      return { isValid: true };
    }

    // Required validation
    if (rules.required && !val.trim()) {
      return { isValid: false, error: t('required', { field: label }) };
    }

    // Skip other validations if empty and not required
    if (!val.trim() && !rules.required) {
      return { isValid: true };
    }

    // Length validations
    if (rules.minLength && val.length < rules.minLength) {
      return {
        isValid: false,
        error: t('minLength', { field: label, min: rules.minLength }),
      };
    }

    if (rules.maxLength && val.length > rules.maxLength) {
      return {
        isValid: false,
        error: t('maxLength', { field: label, max: rules.maxLength }),
      };
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(val)) {
      return {
        isValid: false,
        error: t('invalid', { field: label }),
      };
    }

    // Custom validation
    if (rules.custom) {
      const error = rules.custom(val);
      if (error) {
        return { isValid: false, error };
      }
    }

    return { isValid: true };
  }, [rules, t, label]);

  // 异步验证函数
  const performAsyncValidation = useCallback(async (val: string) => {
    if (!asyncValidation || !val.trim()) {
      return;
    }

    setValidation(prev => ({ ...prev, isValidating: true }));

    try {
      const error = await asyncValidation(val);
      setValidation({
        isValid: !error,
        error: error || undefined,
        isValidating: false,
      });
    } catch (err) {
      setValidation({
        isValid: false,
        error: t('validationError'),
        isValidating: false,
      });
    }
  }, [asyncValidation, t]);

  // 处理值变化
  const handleChange = (newValue: string) => {
    onChange(newValue);

    // 立即进行基础验证
    const basicValidation = validateValue(newValue);
    setValidation(basicValidation);

    // 如果基础验证通过且有异步验证，设置防抖
    if (basicValidation.isValid && asyncValidation) {
      if (asyncValidationTimeout) {
        clearTimeout(asyncValidationTimeout);
      }

      const timeout = setTimeout(() => {
        performAsyncValidation(newValue);
      }, debounceMs);

      setAsyncValidationTimeout(timeout);
    }
  };

  // 处理失焦
  const handleBlur = () => {
    setIsTouched(true);
    const result = validateValue(value);
    setValidation(result);

    // 如果基础验证通过且有异步验证，立即执行
    if (result.isValid && asyncValidation && value.trim()) {
      performAsyncValidation(value);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (asyncValidationTimeout) {
        clearTimeout(asyncValidationTimeout);
      }
    };
  }, [asyncValidationTimeout]);

  const showValidation = isTouched || value.length > 0;
  const hasError = showValidation && !validation.isValid && !validation.isValidating;
  const isSuccess = showValidation && validation.isValid && !validation.isValidating && value.length > 0;

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={name}
        className={cn(
          'text-sm font-medium transition-colors',
          hasError && 'text-destructive',
          isSuccess && 'text-primary',
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={cn(
            'pr-10 transition-all duration-200',
            hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            isSuccess && 'border-primary focus:border-primary focus:ring-primary/20',
            validation.isValidating && 'border-muted-foreground',
          )}
        />

        {/* 验证状态图标 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validation.isValidating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {!validation.isValidating && hasError && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {!validation.isValidating && isSuccess && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
      </div>

      {/* 错误消息 */}
      {hasError && validation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* 成功消息 */}
      {isSuccess && (
        <div className="flex items-center gap-2 text-sm text-primary animate-in slide-in-from-top-1 duration-200">
          <Check className="h-3 w-3 flex-shrink-0" />
          <span>{t('valid', { field: label })}</span>
        </div>
      )}
    </div>
  );
}

// 预定义的验证规则
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,
  },

  phone: {
    pattern: /^\+?[1-9]\d{0,15}$/,
  },

  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-z\s\u4E00-\u9FFF\u3400-\u4DBF]+$/i,
  },

  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },

  postalCode: {
    required: true,
    pattern: /^[a-z0-9\s\-]{3,10}$/i,
  },
};
