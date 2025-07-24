'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Gift, Loader2, Mail, Palette } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMarketingTracker } from '@/components/marketing/MarketingTracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * 🎯 渐进式信息收集：分步降低用户门槛，提高转化率
 *
 * 策略：
 * 1. 先收集邮箱 → 立即营销覆盖
 * 2. 再选择产品 → 提高意向度
 * 3. 最后支付 → 高转化营销
 */

// 验证模式
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const productSchema = z.object({
  color: z.enum(['Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red']),
  priceId: z.string().min(1, 'Please select a price option'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type ProductFormData = z.infer<typeof productSchema>;

type ProgressivePreorderProps = {
  /** 是否启用A/B测试模式 */
  abTestMode?: 'progressive' | 'traditional';
  /** 自定义样式类名 */
  className?: string;
  /** 成功回调 */
  onSuccess?: (data: { email: string; color: string; priceId: string }) => void;
  /** 阶段变化回调 */
  onStageChange?: (stage: number, data: any) => void;
};

export function ProgressivePreorderForm({
  abTestMode = 'progressive',
  className = '',
  onSuccess,
  onStageChange,
}: ProgressivePreorderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [emailData, setEmailData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIncentive, setShowIncentive] = useState(false);
  const { trackInteraction } = useMarketingTracker();

  // 如果是传统模式，直接显示完整表单
  if (abTestMode === 'traditional') {
    return <TraditionalPreorderForm onSuccess={onSuccess} />;
  }

  // 邮箱收集表单
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  // 产品选择表单
  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { color: 'Honey Khaki', priceId: '' },
  });

  // 步骤1：邮箱收集
  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);

    try {
      // 🎯 关键：立即触发营销追踪
      await trackInteraction('fill_form', {
        step: 'email_capture',
        email: data.email,
        progressive_mode: true,
        ab_test_variant: 'progressive',
      });

      // 保存邮箱数据
      setEmailData(data.email);

      // 显示激励信息
      setShowIncentive(true);
      setTimeout(() => setShowIncentive(false), 3000);

      // 进入下一步
      setTimeout(() => {
        setCurrentStep(2);
        onStageChange?.(2, { email: data.email });
      }, 1000);
    } catch (error) {
      console.error('Email submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 步骤2：产品选择
  const handleProductSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      // 🎯 追踪产品选择
      await trackInteraction('select_color', {
        color: data.color,
        price_id: data.priceId,
        email: emailData,
        progressive_mode: true,
      });

      // 完成数据收集，触发支付流程
      const completeData = {
        email: emailData,
        color: data.color,
        priceId: data.priceId,
      };

      onSuccess?.(completeData);
    } catch (error) {
      console.error('Product selection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染步骤指示器
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* 步骤1 */}
        <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
          }`}
          >
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Email</span>
        </div>

        {/* 连接线 */}
        <div className={`w-12 h-0.5 ${currentStep > 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

        {/* 步骤2 */}
        <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
          }`}
          >
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <span className="ml-2 text-sm font-medium">Product</span>
        </div>

        {/* 连接线 */}
        <div className={`w-12 h-0.5 ${currentStep > 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

        {/* 步骤3 */}
        <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 3 ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
          }`}
          >
            {currentStep > 3 ? '✓' : '3'}
          </div>
          <span className="ml-2 text-sm font-medium">Payment</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <StepIndicator />

      {/* 激励提示 */}
      {showIncentive && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <Gift className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-800 font-medium">
            Great! You're now in our exclusive pre-order list! 🎉
          </p>
        </div>
      )}

      {/* 步骤1：邮箱收集 */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Get Early Access</h2>
            <p className="text-muted-foreground">
              Join thousands of customers and be the first to know when we launch!
            </p>
          </div>

          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        className="text-center"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Early Access →
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              ✨ No spam, unsubscribe anytime
            </Badge>
          </div>
        </div>
      )}

      {/* 步骤2：产品选择 */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Choose Your Style</h2>
            <p className="text-muted-foreground">
              Hi
              {' '}
              {emailData.split('@')[0]}
              ! Which color speaks to you?
            </p>
          </div>

          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-6">
              <FormField
                control={productForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Selection</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'Honey Khaki', color: 'bg-yellow-100', label: '🍯 Honey Khaki' },
                          { value: 'Sakura Pink', color: 'bg-pink-100', label: '🌸 Sakura Pink' },
                          { value: 'Healing Green', color: 'bg-green-100', label: '🌿 Healing Green' },
                          { value: 'Moonlight Grey', color: 'bg-gray-100', label: '🌙 Moonlight Grey' },
                          { value: 'Red', color: 'bg-red-100', label: '❤️ Passion Red' },
                        ].map(option => (
                          <label
                            key={option.value}
                            className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                              field.value === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={field.onChange}
                              className="sr-only"
                            />
                            <div className={`w-8 h-8 ${option.color} rounded-full mx-auto mb-2`} />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="priceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Option</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <label className="cursor-pointer border-2 rounded-lg p-4 flex items-center justify-between transition-all hover:border-gray-300">
                          <div>
                            <div className="font-semibold">Early Bird Special</div>
                            <div className="text-sm text-muted-foreground">Limited time offer</div>
                          </div>
                          <div className="text-right">
                            <div className="line-through text-muted-foreground text-sm">$399</div>
                            <div className="text-lg font-bold text-primary">$299</div>
                          </div>
                          <input
                            type="radio"
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            value="price_early_bird"
                            className="ml-4"
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Continue to Payment →
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}

/**
 * 🔄 传统模式：完整表单（用于A/B测试对比）
 */
function TraditionalPreorderForm({ onSuccess: _onSuccess }: { onSuccess?: (data: any) => void }) {
  // 传统表单逻辑...
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Pre-Order Now</h2>
        <p className="text-muted-foreground">
          Complete your order in one simple step
        </p>
      </div>

      {/* 传统完整表单实现 */}
      <div className="p-4 border rounded-lg text-center text-muted-foreground">
        Traditional form implementation here...
      </div>
    </div>
  );
}
