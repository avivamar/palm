import type { Product } from '@/app/actions/productActions';
import { lazy, Suspense } from 'react';
import { getProducts } from '@/app/actions/productActions';
import PaymentErrorBoundary from '@/components/payments/PaymentErrorBoundary';
import { FloatingPaymentButton } from '@/components/pre-order/FloatingPaymentButton';
import { HeroSection } from '@/components/pre-order/hero-section';
import { PreOrderTracking } from '@/components/pre-order/PreOrderTracking';
import { ProductSelection } from '@/components/pre-order/ProductSelection';

import { CountdownTimer, LiveUserActivity, SocialProofCounter, StockAlert, UrgencyBanner } from '@/components/pre-order/realtime-features';

// 延迟加载非关键组件以提升初始加载性能
const FeaturesSection = lazy(() => import('@/components/pre-order/features-section').then(m => ({ default: m.FeaturesSection })));
const SocialProofSection = lazy(() => import('@/components/pre-order/social-proof-section').then(m => ({ default: m.default })));
const TimelineSection = lazy(() => import('@/components/pre-order/timeline-section').then(m => ({ default: m.TimelineSection })));
const Testimonials = lazy(() => import('@/components/pre-order/Testimonials').then(m => ({ default: m.default })));
const VideoSection = lazy(() => import('@/components/pre-order/video-section').then(m => ({ default: m.VideoSection })));
const FaqSection = lazy(() => import('@/components/pre-order/faq-section').then(m => ({ default: m.FaqSection })));
const PreOrderCtaSection = lazy(() => import('@/components/pre-order/pre-order-cta-section').then(m => ({ default: m.PreOrderCtaSection })));

// 加载状态组件
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
    </div>
  );
}

export default async function PreOrderPage() {
  const products: Product[] = await getProducts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PreOrderTracking />
      {/* 顶部紧迫感横幅 */}
      <div className="sticky top-0 z-50">
        <UrgencyBanner />
      </div>

      <HeroSection />

      {/* 库存提醒和倒计时 */}
      <div className="container mx-auto px-4 -mt-8">
        <StockAlert />
        <CountdownTimer />
      </div>

      {/* 非关键功能特性部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <FeaturesSection />
      </Suspense>

      {/* 产品选择区域，包含实时活动 */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PaymentErrorBoundary>
              <ProductSelection products={products} />
            </PaymentErrorBoundary>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LiveUserActivity />
              <SocialProofCounter />
            </div>
          </div>
        </div>
      </div>

      {/* 社交证明部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <SocialProofSection />
      </Suspense>

      {/* 时间线部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <TimelineSection />
      </Suspense>

      {/* 用户评价部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>

      {/* 视频部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <VideoSection />
      </Suspense>

      {/* 常见问题部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <FaqSection />
      </Suspense>

      {/* 最终 CTA 部分 - 延迟加载 */}
      <Suspense fallback={<SectionLoader />}>
        <PreOrderCtaSection />
      </Suspense>

      <FloatingPaymentButton targetId="product-selection" />
    </div>
  );
}
