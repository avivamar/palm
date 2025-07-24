'use client';

import { useTranslations } from 'next-intl';

export function PricingSection({ onColorChange }: { onColorChange: (color: string) => void }) {
  const t = useTranslations('preOrder.pricing');

  const colors = [
    { name: 'Honey Khaki', label: t('colors.honey_khaki'), colorClass: 'bg-yellow-600' },
    { name: 'Sakura Pink', label: t('colors.sakura_pink'), colorClass: 'bg-pink-400' },
    { name: 'Healing Green', label: t('colors.healing_green'), colorClass: 'bg-green-400' },
    { name: 'Moonlight Grey', label: t('colors.moonlight_grey'), colorClass: 'bg-gray-400' },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('description')}</p>
        <div className="mt-10 flex justify-center space-x-4">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => onColorChange(color.name)}
              className="flex flex-col items-center space-y-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg p-2"
            >
              <div className={`w-16 h-16 rounded-full ${color.colorClass}`}></div>
              <span>{color.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
