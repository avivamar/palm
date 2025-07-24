'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { RainbowButton } from './ui/rainbow-button';

// Hero 图片预加载组件
function HeroImage() {
  return (
    <Image
      src="/assets/images/hero.webp" // 使用 WebP 格式
      alt="Rolitt AI companion background"
      fill
      className="object-cover"
      priority
      quality={75} // 降低质量以提升加载速度
      sizes="100vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDAREPEBgUGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAED/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAL/2gAMAwEAAhADEAAAAbMAKf/EABYQAAMAAAAAAAAAAAAAAAAAAAIg/9oACAEBAAEFAkr/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAY/Al//xAAYEAACAwAAAAAAAAAAAAAAAAAAAREgIf/aAAgBAQABPyFqT//aAAwDAQACAAMAAAAQ88//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAZEAACAwEAAAAAAAAAAAAAAAAAARFBYSH/2gAIAQEAAT8QiJWR3CP/2Q=="
    />
  );
}

// 延迟加载的视频组件
function LazyVideo({ onLoad, onPlay, onPause, onError }: {
  onLoad: () => void;
  onPlay: () => void;
  onPause: () => void;
  onError: () => void;
}) {
  return (
    <video
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="none" // 改为 none，减少初始加载
      onLoadedData={onLoad}
      onPlay={onPlay}
      onPause={onPause}
      onError={onError}
      poster="/assets/images/hero.webp"
    >
      <source src="https://cdn.shopify.com/videos/c/o/v/91c75a8172ae49f6aefa91ab6b7caf8b.mp4" type="video/mp4" />
    </video>
  );
}

// 简化的头像组件
function CustomerAvatars() {
  return (
    <div className="mt-16 flex items-center justify-center">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="inline-block h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 shadow-lg bg-gradient-to-br from-primary/30 to-primary/10"
          >
            <Image
              src={`/assets/images/avatars/avatar${i}.webp`} // 使用 WebP
              alt={`Happy customer ${i}`}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              loading="lazy"
              sizes="48px"
            />
          </div>
        ))}
        <div className="inline-block h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <span className="text-xs font-medium text-white">+999</span>
        </div>
      </div>
    </div>
  );
}

export function OptimizedHero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // 延迟检查减少动画偏好以提升性能
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 延迟视频加载以优先渲染主要内容
  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1000); // 1秒后再开始加载视频

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
      {/* 优化的背景图片 - 立即显示 */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="absolute inset-0 bg-gray-900" />}>
          <HeroImage />
        </Suspense>
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 延迟加载的视频 */}
      {showVideo && !prefersReducedMotion && (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <LazyVideo
              onLoad={handleVideoLoad}
              onPlay={() => {}}
              onPause={() => {}}
              onError={() => setIsVideoLoaded(false)}
            />
          </Suspense>
          {isVideoLoaded && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          )}
        </div>
      )}

      {/* 主要内容 - 最高优先级 */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* 关键 LCP 元素 - 简化 */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-2xl">
            <span className="text-primary drop-shadow-lg">Rolitt</span>
            {' '}
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg text-white/90 sm:text-xl drop-shadow-lg">
            {t('description')}
          </p>

          {/* 简化的 CTA 按钮 */}
          <div className="mt-10">
            <RainbowButton
              href={`/${locale}/pre-order?utm_source=rolitt&utm_medium=hero_button&utm_campaign=homepage_promo`}
              variant="enhanced"
              className="min-w-[220px] py-4 px-8 shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <span className="flex items-center text-lg font-bold">
                  {t('primary_button')}
                </span>
                <div className="flex items-center mt-1">
                  <span className="text-sm line-through opacity-70 mr-2">$259</span>
                  <span className="text-xl font-bold">$249</span>
                </div>
              </div>
            </RainbowButton>
          </div>

          {/* 延迟加载客户头像 */}
          <Suspense fallback={null}>
            <CustomerAvatars />
          </Suspense>
        </div>
      </div>

      {/* 简化的装饰元素 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
    </section>
  );
}
