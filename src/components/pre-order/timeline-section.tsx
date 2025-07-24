'use client';

import { useTranslations } from 'next-intl';

export function TimelineSection() {
  const t = useTranslations('preOrder');

  const timeline = [
    {
      name: t('timeline.preOrder.title'),
      description: t('timeline.preOrder.description'),
      date: t('timeline.preOrder.date'),
    },
    {
      name: t('timeline.production.title'),
      description: t('timeline.production.description'),
      date: t('timeline.production.date'),
    },
    {
      name: t('timeline.shipping.title'),
      description: t('timeline.shipping.description'),
      date: t('timeline.shipping.date'),
    },
    {
      name: t('timeline.delivery.title'),
      description: t('timeline.delivery.description'),
      date: t('timeline.delivery.date'),
    },
  ];

  return (
    <div className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('timeline.title')}
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t('timeline.description')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 overflow-hidden sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {timeline.map(item => (
            <div key={item.name}>
              <p className="text-sm font-semibold leading-6 text-primary">
                {item.date}
              </p>
              <h3 className="mt-2 text-lg font-semibold leading-8 tracking-tight text-foreground">
                {item.name}
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
