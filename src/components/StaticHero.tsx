'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RainbowButton } from './ui/rainbow-button';

export function StaticHero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  // const [showVideoControls, setShowVideoControls] = useState(true); // Removed unused state
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true); // Default to true for SSR
  const [isClient, setIsClient] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Ensure client-side hydration consistency
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, [isClient]);

  // Intersection Observer for performance optimization
  useEffect(() => {
    if (!isClient) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsIntersecting(true);
          // Start loading video when hero comes into view
          if (videoRef.current && !prefersReducedMotion) {
            videoRef.current.load();
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [isClient, prefersReducedMotion]);

  // Handle video events
  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, but controls are always visible when video is loaded
        console.warn('Video autoplay failed');
      });
    }
  }, [prefersReducedMotion]);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  const toggleVideo = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          // Video play failed, but we don't need to show controls
          console.warn('Video play failed');
        });
      }
    }
  }, [isVideoPlaying]);

  // Determine what to show based on client state
  const shouldShowVideo = isClient && !prefersReducedMotion && isIntersecting && isVideoLoaded;
  const shouldShowFallback = !isClient || prefersReducedMotion || !isIntersecting || !isVideoLoaded;

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
        {/* Video Background - only show when video is loaded and conditions are met */}
        {isClient && (
          <div className="absolute inset-0 z-0">
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                shouldShowVideo ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={handleVideoLoad}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onError={() => setIsVideoLoaded(false)}
              poster="/assets/images/hero.png"
            >
              <source src="https://cdn.shopify.com/videos/c/o/v/91c75a8172ae49f6aefa91ab6b7caf8b.mp4" type="video/mp4" />
            </video>

            {/* Video overlay for better text readability */}
            {shouldShowVideo && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            )}

            {/* Video controls overlay - only show when video is loaded and playing */}
            {shouldShowVideo && isVideoLoaded && (
              <div className="absolute bottom-4 right-4 z-20">
                <button
                  type="button"
                  onClick={toggleVideo}
                  className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  {isVideoPlaying
                    ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )
                    : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fallback background - always show on server, conditionally on client */}
        {shouldShowFallback && (
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/images/hero.png"
              alt="Rolitt AI companion background"
              fill
              className="object-cover"
              priority
              quality={85}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
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

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <div className="relative">
                {/* Limited availability badge */}
                <div className="absolute -top-10 right-0 flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-bounce font-bold whitespace-nowrap flex items-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Limited Time Offer!
                  </div>
                </div>

                {/* Sales count indicator */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap flex items-center z-10 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="animate-pulse">5 sold</span>
                  {' in last 12 hours'}
                </div>

                <RainbowButton
                  href={`/${locale}/pre-order?utm_source=rolitt&utm_medium=hero_button&utm_campaign=homepage_promo`}
                  variant="enhanced"
                  className="min-w-[220px] py-4 px-8 shadow-2xl"
                >
                  <div className="flex flex-col items-center">
                    <span className="flex items-center text-lg font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {t('primary_button')}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-sm line-through opacity-70 mr-2">$259</span>
                      <span className="text-xl font-bold">$249</span>
                    </div>
                  </div>
                </RainbowButton>
              </div>
            </div>

            {/* Customer testimonials */}
            <div className="mt-16 flex items-center justify-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="inline-block h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 shadow-lg"
                  >
                    {isIntersecting
                      ? (
                          <Image
                            src={`/assets/images/avatars/avatar${i}.jpg`}
                            alt={`Happy customer ${i}`}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            sizes="48px"
                          />
                        )
                      : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse" />
                        )}
                  </div>
                ))}
                {/* Show +2 more indicator */}
                <div className="inline-block h-12 w-12 overflow-hidden rounded-full border-2 border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-xs font-medium text-white">+999</span>
                </div>
              </div>
              <p className="ml-4 text-sm text-white/80 drop-shadow">
                {t('avatar')}
              </p>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 flex flex-col items-center">
              <p className="text-white/60 text-sm mb-4">Scroll to explore</p>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse hidden lg:block" />
        <div className="absolute bottom-1/4 left-10 w-16 h-16 bg-primary/30 rounded-full blur-xl animate-pulse hidden lg:block" />

        {/* Gradient overlay at bottom for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      </section>
    </>
  );
}
