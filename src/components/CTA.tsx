'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 设置倒计时结束日期为当前日期的15天后
const getEndDate = () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 15);
  return endDate;
};

export default function CTA() {
  const t = useTranslations('CTA');
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [endDate] = useState(getEndDate());

  // 确保组件仅在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 实时更新倒计时
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, isMounted]);

  // 如果在服务器端或组件未挂载，返回占位内容
  if (!isMounted) {
    return (
      <section className="py-20 w-full bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            {t('title')}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 w-full bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary/10 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h2>

          <div className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            <p>{t('description')}</p>
          </div>

          <div className="mt-8">
            <div className="flex flex-col items-center">
              {/* 简化的倒计时部分 */}
              <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Early Bird Special</span>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-bold">$70 OFF</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-primary/20 rounded p-2">
                    <div className="text-xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Days</div>
                  </div>
                  <div className="bg-primary/20 rounded p-2">
                    <div className="text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Hours</div>
                  </div>
                  <div className="bg-primary/20 rounded p-2">
                    <div className="text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Mins</div>
                  </div>
                  <div className="bg-primary/20 rounded p-2">
                    <div className="text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs">Secs</div>
                  </div>
                </div>
              </div>

              {/* 简化的按钮部分 */}
              <Link
                href="https://store.rolitt.com/products/rolitt-ai-plush-companion-toy?utm_source=rolitt&utm_medium=hero_button&utm_campaign=homepage_promo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg shadow-lg transition-all mb-6"
              >
                <div className="flex flex-col items-center">
                  <span className="flex items-center text-lg font-bold mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('button_text')}</span>
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm line-through opacity-70 mr-2">$259</span>
                    <span className="text-lg font-bold">$249</span>
                  </div>
                </div>
              </Link>

              {/* 简化的信息部分 */}
              <div className="mt-4 text-xs text-muted-foreground flex flex-col items-center space-y-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure checkout with Stripe, Apple Pay, Google Pay
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free shipping on orders over $99
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  30-day money-back guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
