'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';

import { Button } from '@/components/ui/button';

export const PaymentButton = ({
  disabled,
  type = 'button',
}: {
  disabled?: boolean;
  type?: 'submit' | 'button';
}) => {
  const { pending } = useFormStatus();
  const { trackEvent } = useAnalytics();
  const t = useTranslations('payment');

  useEffect(() => {
    if (pending) {
      trackEvent({
        name: 'begin_checkout',
        parameters: { event_category: 'ecommerce', event_label: 'Pre-order Button Click' },
      });
    }
  }, [pending, trackEvent]);

  return (
    <div className="w-full">
      <Button
        type={type}
        disabled={pending || disabled}
        size="lg"
        className="w-full"
        aria-disabled={pending || disabled}
      >
        {pending
          ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )
          : (
              t('button.pay')
            )}
      </Button>
    </div>
  );
};
