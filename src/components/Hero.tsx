'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FadeIn } from './animations/FadeIn';
import { FloatingElement } from './animations/FloatingElement';

export function Hero() {
  const t = useTranslations('Hero');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // 客户端预订处理函数
  const handlePreOrder = () => {
    if (typeof window !== 'undefined') {
      // 仅在客户端执行
      try {
        // 跳转到预订页面
        window.location.href = '/pre-order';
      } catch (error) {
        // Failed to handle pre-order click
      }
    }
  };

  // 当对话框打开时，聚焦关闭按钮
  useEffect(() => {
    if (isVideoOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isVideoOpen]);

  // 处理ESC键关闭对话框
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window === 'undefined') {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (isVideoOpen && event.key === 'Escape') {
        setIsVideoOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVideoOpen]);

  // 处理对话框背景点击
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && e.target === dialogRef.current) {
      setIsVideoOpen(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32 w-full">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <FadeIn
            delay={0.2}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <h1>
              <span className="text-primary">Rolitt</span>
              {' '}
              {t('title')}
            </h1>
          </FadeIn>

          <FadeIn
            delay={0.5}
            className="mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl"
          >
            <p>{t('description')}</p>
          </FadeIn>

          <FadeIn
            delay={0.7}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <div className="relative mt-8 pt-4">
              {/* Limited availability badge */}
              <div className="absolute -top-7 right-2 flex items-center justify-center">
                <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-bounce font-bold whitespace-nowrap flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last unit - Limited time offer!
                </div>
              </div>

              {/* Sales count indicator */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap flex items-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="animate-pulse">2 sold</span>
                {' in last 8 hours'}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button
                  className="flex items-center gap-2 rounded-full min-w-44 text-primary-foreground font-medium bg-primary hover:bg-primary/90 border border-neutral-400/20 px-6 py-6 relative group overflow-hidden z-10"
                  onClick={handlePreOrder}
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
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Video Thumbnail */}
          <FadeIn
            delay={0.8}
            className="mt-12 w-full max-w-4xl"
          >
            <button
              className="relative w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
              onClick={() => setIsVideoOpen(true)}
              aria-label="Open video: Rolitt Demo Video"
              type="button"
            >
              <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/5 shadow-2xl">
                {!imageError
                  ? (
                      <Image
                        src="/assets/images/hero.png"
                        alt="Video thumbnail"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                      />
                    )
                  : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                        <div className="text-white/50 text-xl">Rolitt Demo Video</div>
                      </div>
                    )}

                {/* 播放按钮 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                    <div className="rounded-full bg-primary p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary-foreground"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 视频标题 */}
                <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/30 p-4 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-white">Rolitt Demo Video</h3>
                  <p className="text-sm text-white/70">Learn more about our smart companions</p>
                </div>
              </div>
            </button>
          </FadeIn>

          <FadeIn
            delay={0.9}
            className="mt-12 flex items-center justify-center"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="inline-block h-10 w-10 overflow-hidden rounded-full border-2 border-background"
                >
                  <Image
                    src={`/assets/images/avatars/avatar${i}.jpg`}
                    alt={`User avatar ${i}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="ml-4 text-sm text-muted-foreground">
              {t('avatar')}
            </p>
          </FadeIn>

          <FloatingElement
            className="absolute -right-20 top-1/4 hidden lg:block"
            amplitude={15}
            duration={5}
          >
            <div className="w-40 h-40 rounded-full bg-primary/20 blur-xl" />
          </FloatingElement>

          <FloatingElement
            className="absolute -left-20 bottom-1/4 hidden lg:block"
            amplitude={20}
            duration={6}
            delay={1}
          >
            <div className="w-32 h-32 rounded-full bg-primary/30 blur-xl" />
          </FloatingElement>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]"></div>

      {/* Video Dialog */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-dialog-title"
        >
          <div
            ref={dialogRef}
            className="fixed inset-0 cursor-pointer"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-4xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <h2 id="video-dialog-title" className="sr-only">Rolitt Video</h2>
            <button
              ref={closeButtonRef}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close video"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/nf7VjhC9R5M?autoplay=1"
                title="Rolitt Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              >
              </iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
