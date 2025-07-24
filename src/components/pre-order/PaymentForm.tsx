/**
 * 增强的支付表单组件
 * 集成实时验证、进度指示器和用户体验优化
 */

'use client';

import type { ProgressStep } from './ProgressIndicator';
import type { Product } from '@/app/actions/productActions';
import { CheckCircle, Clock, Shield, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { handleCheckout } from '@/app/actions/checkoutActions';
import { conversionTracker } from '@/components/analytics/ConversionTrackingSimple';
import { PaymentButton } from '@/components/payments/PaymentButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getColorById, getColorDisplayName } from '@/config/colors';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from './ProgressIndicator';
import { ValidatedInput, validationRules } from './ValidatedInput';

type PaymentFormProps = {
  selectedProduct?: Product;
};

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function PaymentForm({ selectedProduct }: PaymentFormProps) {
  const t = useTranslations('preOrder');
  const tValidation = useTranslations('validation');
  const locale = useLocale();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<ProgressStep>('product');
  const [completedSteps, setCompletedSteps] = useState<ProgressStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  // const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  // 验证单个字段
  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        if (!validationRules.email.pattern?.test(value)) {
          return tValidation('invalidEmail');
        }
        break;
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          return tValidation('required', { field: t(`form.${field}`) });
        }
        if (value.length < 2) {
          return tValidation('minLength', { field: t(`form.${field}`), min: 2 });
        }
        break;
      case 'phone':
        if (value && !validationRules.phone.pattern?.test(value)) {
          return tValidation('invalidPhone');
        }
        break;
      case 'address':
        if (!value.trim()) {
          return tValidation('required', { field: t(`form.${field}`) });
        }
        break;
      case 'city':
        if (!value.trim()) {
          return tValidation('required', { field: t(`form.${field}`) });
        }
        break;
      case 'postalCode':
        if (!value.trim()) {
          return tValidation('required', { field: t(`form.${field}`) });
        }
        break;
    }
    return null;
  }, [t, tValidation]);

  // 验证整个表单 - 根据当前步骤只验证相关字段
  const validateForm = useCallback((step?: ProgressStep): boolean => {
    let isValid = true;
    const currentValidationStep = step || currentStep;

    // 根据步骤定义需要验证的字段
    let fieldsToValidate: string[] = [];

    if (currentValidationStep === 'details' || currentValidationStep === 'payment') {
      // Step 2: 验证个人信息字段
      fieldsToValidate = ['email', 'firstName', 'lastName'];
      // phone 是可选的，只有在有值时才验证
      if (formData.phone) {
        fieldsToValidate.push('phone');
      }
    }

    if (currentValidationStep === 'payment') {
      // Step 3: 额外验证收货地址字段
      fieldsToValidate.push('address', 'city', 'state', 'postalCode', 'country');
    }

    fieldsToValidate.forEach((field) => {
      const value = formData[field as keyof FormData];
      const error = validateField(field, value);
      if (error) {
        isValid = false;
      }
    });

    return isValid;
  }, [formData, validateField, currentStep]);

  // Initialize conversion tracking on mount
  useEffect(() => {
    // Track checkout start
    conversionTracker.trackEvent('interest', 'page_view', {
      userId: user?.uid || user?.id,
      step: 'checkout_start',
    });
  }, [user]);

  // Track step changes
  useEffect(() => {
    conversionTracker.trackFunnelStage('interest');
  }, [currentStep, completedSteps]);

  // Track product selection
  useEffect(() => {
    if (selectedProduct) {
      conversionTracker.trackEvent('interest', 'button_click', {
        productId: selectedProduct.priceId,
        color: selectedProduct.color,
      });
    }
  }, [selectedProduct]);

  // 处理字段变化
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // setFormTouched(prev => ({ ...prev, [field]: true }));

    // 实时验证
    const error = validateField(field, value);

    // Track form errors for conversion analysis
    if (error) {
      conversionTracker.trackEvent('consideration', 'form_submit', {
        error,
        field,
      });
    }
  }, [validateField]);

  // 邮箱异步验证（检查是否已存在）
  const validateEmailAsync = useCallback(async (email: string): Promise<string | null> => {
    if (!validationRules.email.pattern?.test(email)) {
      return null; // 基础验证会处理
    }

    try {
      // 模拟API调用检查邮箱是否已存在
      await new Promise(resolve => setTimeout(resolve, 800));

      // 这里可以集成真实的API调用
      // const response = await fetch('/api/check-email', { ... });

      return null; // 邮箱可用
    } catch {
      return tValidation('emailCheckError');
    }
  }, [tValidation]);

  // 处理表单提交
  const handleSubmit = async (formData: FormData) => {
    if (!selectedProduct) {
      return;
    }

    setIsProcessing(true);

    // Track payment start
    conversionTracker.trackEvent('purchase', 'form_submit', {
      value: (selectedProduct.price || 0) / 100,
      currency: selectedProduct.currency || 'USD',
    });

    try {
      // 构建表单数据
      const submitData = new FormData();
      submitData.append('priceId', selectedProduct.priceId);
      submitData.append('color', selectedProduct.color);
      submitData.append('locale', locale);
      submitData.append('email', formData.email);
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('phone', formData.phone);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('postalCode', formData.postalCode);
      submitData.append('country', formData.country);

      if (user?.uid || user?.id) {
        submitData.append('userId', user.uid || user.id);
      }

      await handleCheckout(submitData);

      // Note: Payment success will be tracked on the success page
      // since this redirect happens before we can track it here
    } catch (error) {
      console.error('Payment error:', error);

      // Track payment failure
      conversionTracker.trackEvent('purchase', 'form_submit', {
        error: error instanceof Error ? error.message : 'Unknown payment error',
        errorType: 'checkout_error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 进度管理
  const canProceedToStep = useCallback((step: ProgressStep): boolean => {
    switch (step) {
      case 'product':
        return true;
      case 'details':
        return !!selectedProduct;
      case 'payment':
        // 验证到 payment 步骤时，只验证 details 步骤的字段
        return !!selectedProduct && validateForm('details');
      case 'confirmation':
        return false; // 只有支付成功后才能到达
      default:
        return false;
    }
  }, [selectedProduct, validateForm]);

  const nextStep = () => {
    const steps: ProgressStep[] = ['product', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    const nextStepValue = steps[currentIndex + 1];

    if (nextStepValue && canProceedToStep(nextStepValue)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(nextStepValue);
    }
  };

  const prevStep = () => {
    const steps: ProgressStep[] = ['product', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    const prevStepValue = steps[currentIndex - 1];

    if (prevStepValue) {
      setCompletedSteps(prev => prev.filter(step => step !== currentStep));
      setCurrentStep(prevStepValue);
    }
  };

  // 自动步骤进行
  useEffect(() => {
    if (currentStep === 'product' && selectedProduct) {
      setTimeout(() => nextStep(), 500);
    }
  }, [selectedProduct, currentStep]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 进度指示器 */}
      <ProgressIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* 产品摘要卡片 */}
      {selectedProduct && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getColorById(selectedProduct.color)?.imagePath || `/pre-order/${selectedProduct.color.toLowerCase()}.png`}
                  alt={getColorDisplayName(selectedProduct.color)}
                  className="h-16 w-16 object-cover rounded-lg"
                />
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                  {getColorDisplayName(selectedProduct.color)}
                </Badge>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">Rolitt AI Companion</h3>
                <p className="text-muted-foreground text-sm">
                  {getColorDisplayName(selectedProduct.color)}
                  {' '}
                  • Pre-order
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: selectedProduct.currency || 'USD',
                  }).format((selectedProduct.price || 0) / 100)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.includesTax')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 表单内容 */}
      {currentStep === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              {t('form.personalInfo')}
            </CardTitle>
            <CardDescription>
              {t('form.personalInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                name="firstName"
                label={t('form.firstName')}
                value={formData.firstName}
                onChange={value => handleFieldChange('firstName', value)}
                rules={{ required: true, minLength: 2 }}
                required
              />

              <ValidatedInput
                name="lastName"
                label={t('form.lastName')}
                value={formData.lastName}
                onChange={value => handleFieldChange('lastName', value)}
                rules={{ required: true, minLength: 2 }}
                required
              />
            </div>

            <ValidatedInput
              name="email"
              label={t('form.email')}
              type="email"
              value={formData.email}
              onChange={value => handleFieldChange('email', value)}
              rules={validationRules.email}
              asyncValidation={validateEmailAsync}
              disabled={!!user?.email}
              required
            />

            <ValidatedInput
              name="phone"
              label={t('form.phone')}
              type="tel"
              value={formData.phone}
              onChange={value => handleFieldChange('phone', value)}
              rules={validationRules.phone}
              placeholder="+1 (555) 123-4567"
            />
          </CardContent>
        </Card>
      )}

      {currentStep === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              {t('form.shippingInfo')}
            </CardTitle>
            <CardDescription>
              {t('form.shippingInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ValidatedInput
              name="address"
              label={t('form.address')}
              value={formData.address}
              onChange={value => handleFieldChange('address', value)}
              rules={validationRules.address}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                name="city"
                label={t('form.city')}
                value={formData.city}
                onChange={value => handleFieldChange('city', value)}
                rules={{ required: true }}
                required
              />

              <ValidatedInput
                name="state"
                label={t('form.state')}
                value={formData.state}
                onChange={value => handleFieldChange('state', value)}
                rules={{ required: true }}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                name="postalCode"
                label={t('form.postalCode')}
                value={formData.postalCode}
                onChange={value => handleFieldChange('postalCode', value)}
                rules={validationRules.postalCode}
                required
              />

              <ValidatedInput
                name="country"
                label={t('form.country')}
                value={formData.country}
                onChange={value => handleFieldChange('country', value)}
                rules={{ required: true }}
                required
              />
            </div>

            <Separator className="my-6" />

            {/* 支付安全提示 */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{t('security.title')}</strong>
                  <br />
                  {t('security.description')}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {t('security.processing')}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* 表单动作按钮 */}
      <div className="flex justify-between items-center">
        {currentStep !== 'product' && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ←
            {' '}
            {t('form.previous')}
          </button>
        )}

        <div className="ml-auto">
          {currentStep === 'details' && (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToStep('payment')}
              className={cn(
                'px-6 py-2 rounded-md font-medium transition-all',
                canProceedToStep('payment')
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {t('form.continue')}
              {' '}
              →
            </button>
          )}

          {currentStep === 'payment' && (
            <form action={() => handleSubmit(formData)}>
              <PaymentButton
                type="submit"
                disabled={!validateForm('payment') || isProcessing}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
