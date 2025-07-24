import { Bell, CreditCard, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type QuickLinksCardProps = {
  t: (key: string, params?: any) => string;
};

export default function QuickLinksCard({ t }: QuickLinksCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          {t('quick_links.title')}
        </CardTitle>
        <CardDescription>{t('quick_links.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            href="/dashboard/orders"
            icon={<ShoppingBag className="h-5 w-5" />}
            label={t('quick_links.my_orders')}
            gradient="from-blue-500 to-cyan-500"
          />
          <QuickLink
            href="/dashboard/favorites"
            icon={<Heart className="h-5 w-5" />}
            label={t('quick_links.favorites')}
            gradient="from-pink-500 to-rose-500"
          />
          <QuickLink
            href="/dashboard/billing"
            icon={<CreditCard className="h-5 w-5" />}
            label={t('quick_links.billing_management')}
            gradient="from-emerald-500 to-teal-500"
          />
          <QuickLink
            href="/contact"
            icon={<Bell className="h-5 w-5" />}
            label={t('quick_links.customer_support')}
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}

type QuickLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  gradient: string;
};

function QuickLink({ href, icon, label, gradient }: QuickLinkProps) {
  return (
    <Link href={href}>
      <div className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white/60 dark:bg-gray-800/40 hover:bg-white/80 dark:hover:bg-gray-800/60 transition-all duration-300 cursor-pointer border border-gray-100/50 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-center group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{label}</span>
      </div>
    </Link>
  );
}
