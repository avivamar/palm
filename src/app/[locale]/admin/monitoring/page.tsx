/**
 * Admin Monitoring Page - Updated to use Admin Package
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import { Monitoring } from '@rolitt/admin';
import { getTranslations } from 'next-intl/server';
import { getPaymentHealthStatus, getPaymentMetrics } from '@/libs/monitoring/payment-monitor';

// Force dynamic rendering for admin monitoring page
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MonitoringPage({ params }: Props) {
  const { locale } = await params;
  const [t, metrics, healthStatus] = await Promise.all([
    getTranslations('admin'),
    getPaymentMetrics(),
    getPaymentHealthStatus(),
  ]);

  // Build translations object for the monitoring component
  const translations = {
    title: t('monitoring.title'),
    description: t('monitoring.description'),
    systemHealth: {
      title: t('monitoring.systemHealth.title'),
      healthy: t('monitoring.systemHealth.healthy'),
      warning: t('monitoring.systemHealth.warning'),
      critical: t('monitoring.systemHealth.critical'),
    },
    alerts: {
      title: t('monitoring.alerts.title'),
      noAlerts: t('monitoring.alerts.noAlerts'),
      viewAll: t('monitoring.alerts.viewAll'),
    },
    metrics: {
      totalPayments: t('monitoring.metrics.totalPayments'),
      successfulPayments: t('monitoring.metrics.successfulPayments'),
      failedPayments: t('monitoring.metrics.failedPayments'),
      successRate: t('monitoring.metrics.successRate'),
    },
  };

  return (
    <Monitoring
      locale={locale}
      translations={translations}
      metrics={metrics}
      healthStatus={healthStatus}
    />
  );
}
