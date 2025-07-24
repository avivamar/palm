'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import Confetti from 'react-confetti';

import { Button } from '@/components/ui/button';

function SuccessContent() {
  const t = useTranslations('PaymentSuccess');
  const [showConfetti, setShowConfetti] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setShowConfetti(true);
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 8000); // 让礼花持续8秒
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] flex-col items-center justify-center overflow-hidden bg-gray-50 p-4 text-center dark:bg-gray-900">
      {showConfetti && <Confetti width={dimensions.width} height={dimensions.height} />}
      <div className="z-10 rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800 md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {t('message')}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t('support_message')}
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">{t('button_back_home')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
