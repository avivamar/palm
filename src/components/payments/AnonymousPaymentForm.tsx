'use client';

import { Loader2, ShoppingCart, User, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import PaymentErrorBoundary from './PaymentErrorBoundary';

type PaymentFormData = {
  email: string;
  name: string;
  phone?: string;
};

type AnonymousPaymentFormProps = {
  productId: string;
  amount: number;
  currency: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
};

/**
 * 匿名支付表单组件
 * 支持已登录用户和匿名用户进行支付
 */
export function AnonymousPaymentForm({
  productId,
  amount,
  currency,
  onSuccess,
  onError,
}: AnonymousPaymentFormProps) {
  const t = useTranslations('payment');
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    email: user?.email || '',
    name: user?.displayName || '',
    phone: '',
  });

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 验证表单数据
      if (!formData.email || !formData.name) {
        throw new Error('Please fill in all required fields');
      }

      // 创建支付意图
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          amount,
          currency,
          customerInfo: {
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            isAuthenticated,
            userId: user?.uid || user?.id,
          },
          metadata: {
            source: 'anonymous_payment_form',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // 重定向到Stripe Checkout或处理客户端支付
      if (clientSecret) {
        // 这里可以集成Stripe Elements或重定向到Checkout
        console.warn('Payment intent created:', paymentIntentId);
        onSuccess?.(paymentIntentId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentErrorBoundary>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <CardTitle>{t('form.title')}</CardTitle>
          </div>
          <CardDescription>
            {isAuthenticated
              ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <UserCheck className="h-4 w-4" />
                    <span>
                      Signed in as
                      {' '}
                      {user?.email}
                    </span>
                  </div>
                )
              : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Continue as guest or sign in for faster checkout</span>
                  </div>
                )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            {/* 订单摘要 */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span>
                  Product ID:
                  {' '}
                  {productId}
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.toUpperCase(),
                  }).format(amount / 100)}
                </span>
              </div>
            </div>

            <Separator />

            {/* 客户信息 */}
            <div className="space-y-4">
              <h3 className="font-medium">Customer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isAuthenticated && !!user?.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isAuthenticated && !!user?.displayName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <Separator />

            {/* 支付按钮 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  )
                : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('button.pay')}
                      {' '}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currency.toUpperCase(),
                      }).format(amount / 100)}
                    </>
                  )}
            </Button>

            {/* 安全提示 */}
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your payment information is secure and encrypted.
              {!isAuthenticated && (
                <>
                  <br />
                  <span className="text-primary">
                    Sign in to save your information for future purchases.
                  </span>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </PaymentErrorBoundary>
  );
}

/**
 * 使用示例组件
 */
export function PaymentExample() {
  const handleSuccess = (paymentIntentId: string) => {
    console.warn('Payment successful:', paymentIntentId);
    // 重定向到成功页面或显示成功消息
  };

  const handleError = (error: Error) => {
    console.error('Payment failed:', error);
    // 显示错误消息
  };

  return (
    <AnonymousPaymentForm
      productId="prod_example"
      amount={2999} // $29.99 in cents
      currency="usd"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
