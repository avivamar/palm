'use client';

import { useTranslations } from 'next-intl';
import { RainbowButton } from './ui/rainbow-button';

export function StaticCTA() {
  const t = useTranslations('CTA');

  return (
    <section className="py-20 md:py-32 w-full relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary/10 p-8 text-center md:p-12 relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h2>
          <div className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            <p>{t('description')}</p>
          </div>
          <div className="mt-8">
            <RainbowButton href="/contact">
              {t('button_text')}
            </RainbowButton>
          </div>

          <div className="absolute -right-10 -top-10 hidden md:block">
            <div className="w-24 h-24 rounded-full bg-primary/30 blur-lg" />
          </div>

          <div className="absolute -left-10 -bottom-10 hidden md:block">
            <div className="w-20 h-20 rounded-full bg-primary/20 blur-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
