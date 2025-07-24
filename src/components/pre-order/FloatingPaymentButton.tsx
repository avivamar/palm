'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export function FloatingPaymentButton({ targetId }: { targetId: string }) {
  const t = useTranslations('preOrder.product_selection');

  const scrollToSelection = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
      <Button
        onClick={scrollToSelection}
        size="lg"
        className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
      >
        {t('go_to_payment_button')}
      </Button>
    </div>
  );
}
