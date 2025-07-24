'use client';

import { useTranslations } from 'next-intl';

export default function Testimonials() {
  const t = useTranslations('PreOrderTestimonials');
  return (
    <section className="bg-gray-900 dark:bg-gray-950 text-white py-12 relative z-10" id="testimonials" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto px-4 relative" suppressHydrationWarning>
        <h3 className="text-2xl font-bold text-center mb-8 text-white relative z-10" suppressHydrationWarning>{t('title')}</h3>
        <p className="text-center text-gray-300 mb-8 relative z-10" suppressHydrationWarning>{t('rating')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
          <div className="h-60 bg-gray-800 dark:bg-gray-900 flex items-center justify-center rounded-lg text-white font-medium border border-gray-600 dark:border-gray-700 relative z-10" suppressHydrationWarning>{t('video1')}</div>
          <div className="h-60 bg-gray-800 dark:bg-gray-900 flex items-center justify-center rounded-lg text-white font-medium border border-gray-600 dark:border-gray-700 relative z-10" suppressHydrationWarning>{t('video2')}</div>
          <div className="h-60 bg-gray-800 dark:bg-gray-900 flex items-center justify-center rounded-lg text-white font-medium border border-gray-600 dark:border-gray-700 relative z-10" suppressHydrationWarning>{t('video3')}</div>
        </div>
      </div>
    </section>
  );
}
