'use client';

import { ArrowDown, Clock, Shield, Sparkles, Star, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const t = useTranslations('preOrder');

  const scrollToProductSelection = () => {
    const element = document.getElementById('product-selection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Feature items from translations
  const featureItems = [
    {
      icon: t('hero.features.innovation.icon'),
      text: t('hero.features.innovation.text'),
    },
    {
      icon: t('hero.features.quality.icon'),
      text: t('hero.features.quality.text'),
    },
    {
      icon: t('hero.features.limited.icon'),
      text: t('hero.features.limited.text'),
    },
    {
      icon: t('hero.features.fast_delivery.icon'),
      text: t('hero.features.fast_delivery.text'),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-main via-brand-accent to-brand-main py-12 sm:py-20 lg:py-32">
      {/* Performance-optimized background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-0 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-white/30 blur-3xl will-change-transform" />
        <div className="absolute right-0 top-1/4 h-[25vh] w-[25vh] rounded-full bg-white/20 blur-2xl will-change-transform" />
        <div className="absolute bottom-0 left-0 h-[25vh] w-[25vh] rounded-full bg-white/20 blur-2xl will-change-transform" />
      </div>

      {/* Minimal star decorations for performance */}
      <div className="absolute inset-0 opacity-60">
        <Star className="absolute left-[10%] top-[20%] h-3 w-3 sm:h-4 sm:w-4 animate-pulse text-white/80 will-change-transform" />
        <Star className="absolute right-[15%] top-[35%] h-2 w-2 sm:h-3 sm:w-3 animate-pulse text-white/60 [animation-delay:1s] will-change-transform" />
        <Sparkles className="absolute right-[20%] bottom-[25%] h-4 w-4 sm:h-6 sm:w-6 animate-pulse text-white/70 [animation-delay:0.5s] will-change-transform" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Marketing-first: Urgency banner */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-white backdrop-blur-sm animate-pulse">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="uppercase tracking-wide">{t('hero.urgency_banner')}</span>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>

          {/* Mobile-first: Optimized heading hierarchy */}
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">{t('hero.title')}</span>
            </h1>

            {/* Mobile-optimized subtitle */}
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-800 sm:mt-6 sm:text-lg md:text-xl lg:leading-8">
              {t('hero.description')}
            </p>
          </div>

          {/* Marketing-first: Enhanced CTA section */}
          <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4 sm:gap-6">
            {/* Primary CTA with enhanced mobile design */}
            <div className="relative w-full max-w-sm sm:max-w-none sm:w-auto">
              {/* Performance-optimized glow effect */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 opacity-75 blur-sm animate-pulse will-change-transform" />

              <Button
                onClick={scrollToProductSelection}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:w-auto sm:px-12 sm:py-6 sm:text-xl md:text-2xl rounded-full border-2 border-white/30"
              >
                {/* Subtle shimmer for performance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />

                <span className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-12 will-change-transform" />
                  <span className="min-w-0">{t('hero.cta')}</span>
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-y-1 animate-bounce will-change-transform" />
                </span>
              </Button>
            </div>

            {/* Marketing: Enhanced value proposition */}
            <div className="text-center space-y-2 sm:space-y-3">
              {/* Urgency text with better mobile visibility */}
              <div className="relative">
                <p className="text-lg font-bold text-black-700 sm:text-xl md:text-2xl animate-pulse">
                  {t('hero.limited_time_text')}
                </p>
              </div>

              {/* Mobile-optimized benefits */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-sm sm:text-base font-semibold text-gray-800">
                <span className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  {t('hero.benefits.save_money')}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  {t('hero.benefits.free_shipping')}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-red-600" />
                  {t('hero.benefits.limited_stock')}
                </span>
              </div>
            </div>

            {/* Social proof with mobile optimization */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 text-sm text-gray-700">
              <div className="flex -space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-sm"
                  />
                ))}
              </div>
              <span className="font-medium text-center sm:text-left">
                <span className="text-red-600 font-bold">🔥 1,247+</span>
                {' '}
                customers pre-ordered this week
              </span>
            </div>
          </div>

          {/* Feature tags with mobile-first design */}
          <div className="mt-10 sm:mt-16 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 md:gap-4">
            {featureItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-900 shadow-md transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 will-change-transform"
              >
                <span className="text-sm sm:text-base">{item.icon}</span>
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6 text-xs sm:text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span>{t('hero.trust_indicators.money_back')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <span>{t('hero.trust_indicators.warranty')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span>{t('hero.trust_indicators.rating')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance-optimized bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-white/50 to-transparent will-change-transform" />
    </section>
  );
}
