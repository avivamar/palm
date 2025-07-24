'use client';

import { HeartCrack } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PreOrderCancel() {
  const t = useTranslations('PaymentCancel');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/pre-order?utm_source=cancel&utm_medium=redirect&utm_campaign=retry#product-selection');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center dark:bg-gray-900">
      <div className="m-4 max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex justify-center">
          <HeartCrack className="h-20 w-20 animate-bounce text-red-400" />
        </div>
        <h1 className="mb-3 text-4xl font-extrabold text-gray-800 dark:text-white">{t('title')}</h1>
        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">{t('message')}</p>
        <Link href="/pre-order?utm_source=cancel&utm_medium=button&utm_campaign=retry#product-selection">
          <div className="transform rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-105 hover:from-pink-600 hover:to-orange-500">
            {t('button_try_again')}
          </div>
        </Link>
      </div>
    </div>
  );
}
