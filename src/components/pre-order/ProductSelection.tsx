'use client';

import type { Product } from '@/app/actions/productActions';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { handleCheckout } from '@/app/actions/checkoutActions';
import { conversionTracker } from '@/components/analytics/ConversionTrackingSimple';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getColorById, getColorDisplayName, getEnabledColors } from '@/config/colors';
import { cn } from '@/lib/utils';

export function ProductSelection({ products }: { products: Product[] }) {
  const t = useTranslations('preOrder.product_selection');
  const locale = useLocale();
  const [isClient, setIsClient] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const enabledColors = getEnabledColors();
    const colorOrder = enabledColors.map(color => color.id);

    const sorted = [...products].sort((a, b) => {
      const indexA = colorOrder.indexOf(a.color);
      const indexB = colorOrder.indexOf(b.color);
      if (indexA === -1 && indexB === -1) {
        return 0;
      }
      if (indexA === -1) {
        return 1;
      }
      if (indexB === -1) {
        return -1;
      }
      return indexA - indexB;
    });

    setDisplayedProducts(sorted);

    if (!selectedProduct && sorted.length > 0) {
      setSelectedProduct(sorted[0]);

      // Track initial product view
      conversionTracker.trackEvent('awareness', 'page_view', {
        productId: sorted[0]?.priceId || '',
        color: sorted[0]?.color || '',
      });
    }
  }, [products, selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);

    // Track product selection for conversion analysis
    conversionTracker.trackEvent('interest', 'button_click', {
      productId: product.priceId || '',
      color: product.color || '',
    });
  };

  const handlePaymentSubmit = async () => {
    if (!selectedProduct || !email || !email.includes('@')) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log(`[ProductSelection] 🎯 Starting async payment flow for ${selectedProduct.color} - ${email}`);

      // Track conversion event - 用户开始支付意向
      conversionTracker.trackEvent('interest', 'checkout_start', {
        productId: selectedProduct.priceId,
        color: selectedProduct.color,
        email,
        value: (selectedProduct.price || 0) / 100,
        currency: selectedProduct.currency || 'USD',
      });

      // 🚀 异步支付处理模式: 表单数据 → initiatePreorder → handleCheckout → Stripe重定向
      const formData = new FormData();
      formData.append('email', email);
      formData.append('color', selectedProduct.color);
      formData.append('priceId', selectedProduct.priceId);
      formData.append('locale', locale);

      console.log(`[ProductSelection] ⚡ Initiating async payment flow...`);

      // 🎯 目标: < 300ms 响应时间
      // handleCheckout 将:
      // 1. 调用 initiatePreorder 创建预订记录(status: initiated)
      // 2. 异步处理营销事件(非阻塞)
      // 3. 创建 Stripe 会话并立即重定向
      await handleCheckout(formData);
    } catch (error) {
      console.error('[ProductSelection] ❌ Async payment flow error:', error);
      setIsProcessing(false);
    }
  };

  if (!products.length) {
    return (
      <Card id="product-selection" className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{t('no_products_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('no_products_description')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="product-selection" className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isClient
          ? (
              <div className="animate-pulse space-y-6">
                <div className="space-y-2">
                  <div className="h-6 w-24 rounded bg-gray-300" />
                  <div className="flex flex-wrap justify-center gap-4 pt-2">
                    <div className="h-32 w-32 rounded-lg bg-gray-300" />
                    <div className="h-32 w-32 rounded-lg bg-gray-300" />
                    <div className="h-32 w-32 rounded-lg bg-gray-300" />
                    <div className="h-32 w-32 rounded-lg bg-gray-300" />
                  </div>
                </div>
                <div className="mx-auto h-12 w-48 rounded bg-gray-300" />
              </div>
            )
          : (
              <>
                <div className="space-y-4">
                  <Label className="text-base font-medium">{t('color_label')}</Label>
                  <RadioGroup
                    value={selectedProduct?.priceId}
                    onValueChange={(priceId) => {
                      const product = displayedProducts.find(p => p.priceId === priceId);
                      if (product) {
                        handleProductSelect(product);
                      }
                    }}
                    className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-6"
                  >
                    {displayedProducts.map(product => (
                      <Label
                        key={product.priceId}
                        htmlFor={product.priceId}
                        className={cn(
                          'group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 ease-out sm:h-40 sm:w-40',
                          'bg-gradient-to-br from-background to-muted/30',
                          'hover:scale-[1.02] hover:shadow-lg',
                          selectedProduct?.priceId === product.priceId
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5',
                        )}
                      >
                        <RadioGroupItem
                          value={product.priceId}
                          id={product.priceId}
                          className="sr-only"
                        />
                        {selectedProduct?.priceId === product.priceId && (
                          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="relative mb-3 overflow-hidden rounded-xl">
                          <img
                            src={getColorById(product.color)?.imagePath || `/pre-order/${product.color.toLowerCase()}.png`}
                            alt={getColorDisplayName(product.color)}
                            className="h-20 w-20 object-cover transition-transform duration-200 group-hover:scale-105 sm:h-24 sm:w-24"
                          />
                          <div
                            className={cn(
                              'absolute inset-0 rounded-xl transition-opacity duration-200',
                              selectedProduct?.priceId === product.priceId
                                ? 'bg-primary/10'
                                : 'bg-transparent group-hover:bg-primary/5',
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold transition-colors duration-200',
                            selectedProduct?.priceId === product.priceId
                              ? 'text-primary'
                              : 'text-foreground group-hover:text-primary',
                          )}
                        >
                          {getColorDisplayName(product.color)}
                        </span>
                        <div
                          className={cn(
                            'absolute bottom-0 left-1/2 h-1 -translate-x-1/2 rounded-full transition-all duration-200',
                            selectedProduct?.priceId === product.priceId
                              ? 'w-12 bg-primary'
                              : 'w-0 bg-primary group-hover:w-8',
                          )}
                        />
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="text-center text-4xl font-bold">
                  {selectedProduct && new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: selectedProduct.currency || 'USD',
                  }).format((selectedProduct.price || 0) / 100)}
                </div>

                {/* 邮箱输入区域 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      {t('email_label') || 'Email Address'}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('email_placeholder') || 'your@email.com'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isProcessing}
                      required
                    />
                  </div>

                  <button
                    onClick={handlePaymentSubmit}
                    disabled={!selectedProduct || !email || !email.includes('@') || isProcessing}
                    className={cn(
                      'w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200',
                      'bg-primary text-primary-foreground hover:bg-primary/90',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    )}
                  >
                    {isProcessing
                      ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            {t('processing') || 'Processing...'}
                          </div>
                        )
                      : (
                          <>
                            {t('pay_now') || 'Pay Now'}
                            {' '}
                            -
                            {selectedProduct && new Intl.NumberFormat(locale, {
                              style: 'currency',
                              currency: selectedProduct.currency || 'USD',
                            }).format((selectedProduct.price || 0) / 100)}
                          </>
                        )}
                  </button>

                  {/* 安全提示 */}
                  <div className="text-center text-xs text-gray-500 mt-2">
                    🔒
                    {' '}
                    {t('secure_payment') || 'Secure payment via Stripe • You\'ll be redirected for safe checkout'}
                  </div>
                </div>
              </>
            )}
      </CardContent>
    </Card>
  );
}
