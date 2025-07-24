import { Activity, BarChart3, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Force dynamic rendering for admin dashboard
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

type QuickStatProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
};

function QuickStat({ title, value, change, icon: Icon, trend }: QuickStatProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn(
          'text-xs flex items-center gap-1',
          trend === 'up' && 'text-green-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-muted-foreground',
        )}
        >
          {trend === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

type ModuleCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  disabled?: boolean;
  locale: string;
  buttonText: string;
  comingSoonText?: string;
};

function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
  locale,
  buttonText,
  comingSoonText,
}: ModuleCardProps) {
  return (
    <Card className={cn(disabled && 'opacity-60')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span className="flex-1">{title}</span>
          {disabled && comingSoonText && (
            <Badge variant="secondary" className="text-xs">
              {comingSoonText}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {disabled
          ? (
              <Button disabled className="w-full" aria-label={`${title} - ${comingSoonText}`}>
                {buttonText}
              </Button>
            )
          : (
              <Link href={`/${locale}${href}`} className="block">
                <Button className="w-full">
                  {buttonText}
                </Button>
              </Link>
            )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('admin.dashboard');

  // Mock data - in real app, this would come from your data layer
  const quickStats = [
    {
      title: t('quickStats.totalUsers'),
      value: '1,234',
      change: '+20.1% from last month',
      icon: Users,
      trend: 'up' as const,
    },
    {
      title: t('quickStats.totalOrders'),
      value: '567',
      change: '+12.5% from last month',
      icon: ShoppingCart,
      trend: 'up' as const,
    },
    {
      title: t('quickStats.revenue'),
      value: '$45,231',
      change: '+8.2% from last month',
      icon: DollarSign,
      trend: 'up' as const,
    },
    {
      title: t('quickStats.conversionRate'),
      value: '3.2%',
      change: '+0.5% from last month',
      icon: TrendingUp,
      trend: 'up' as const,
    },
  ];

  const modules = [
    {
      title: t('modules.monitoring.title'),
      description: t('modules.monitoring.description'),
      icon: Activity,
      href: '/admin/monitoring',
      disabled: false,
      buttonText: t('modules.monitoring.viewDashboard'),
    },
    {
      title: t('modules.users.title'),
      description: t('modules.users.description'),
      icon: Users,
      disabled: true,
      buttonText: t('modules.users.comingSoon'),
      comingSoonText: t('modules.users.comingSoon'),
    },
    {
      title: t('modules.orders.title'),
      description: t('modules.orders.description'),
      icon: ShoppingCart,
      disabled: true,
      buttonText: t('modules.orders.comingSoon'),
      comingSoonText: t('modules.orders.comingSoon'),
    },
    {
      title: t('modules.analytics.title'),
      description: t('modules.analytics.description'),
      icon: BarChart3,
      disabled: true,
      buttonText: t('modules.analytics.comingSoon'),
      comingSoonText: t('modules.analytics.comingSoon'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Quick Stats */}
      <section aria-labelledby="quick-stats-title">
        <h2 id="quick-stats-title" className="text-lg font-semibold mb-4">
          {t('quickStats.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <QuickStat key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Main Modules */}
      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-lg font-semibold mb-4">
          Management Modules
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              {...module}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
