/**
 * Monitoring Feature Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type {
  HealthStatus,
  HealthStatusData,
  MonitoringTranslations,
  PaymentMetrics,
} from './types';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAdminStore } from '../../stores/admin-store';

type MonitoringProps = {
  locale: string;
  translations: MonitoringTranslations;
  metrics: PaymentMetrics;
  healthStatus: HealthStatusData;
};

type StatusBadgeProps = {
  status: HealthStatus;
  children: React.ReactNode;
};

function StatusBadge({ status, children }: StatusBadgeProps) {
  const getStatusVariant = (status: HealthStatus) => {
    switch (status) {
      case 'healthy': return 'default' as const;
      case 'warning': return 'secondary' as const;
      case 'critical': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <Badge
      variant={getStatusVariant(status)}
      className={cn(
        'font-medium',
        status === 'healthy' && 'bg-green-100 text-green-800 hover:bg-green-100',
        status === 'warning' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        status === 'critical' && 'bg-red-100 text-red-800 hover:bg-red-100',
      )}
    >
      {children}
    </Badge>
  );
}

function getStatusIcon(status: HealthStatus) {
  const iconClass = 'h-5 w-5';
  switch (status) {
    case 'healthy':
      return <CheckCircle className={cn(iconClass, 'text-green-600')} aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle className={cn(iconClass, 'text-yellow-600')} aria-hidden="true" />;
    case 'critical':
      return <XCircle className={cn(iconClass, 'text-red-600')} aria-hidden="true" />;
    default:
      return <Activity className={cn(iconClass, 'text-muted-foreground')} aria-hidden="true" />;
  }
}

export function Monitoring({ translations, metrics, healthStatus }: MonitoringProps) {
  const { actions } = useAdminStore();

  useEffect(() => {
    // Load monitoring module on mount
    actions.loadModule('monitoring');
  }, [actions]);

  // Since we receive data as props, no need for loading state
  // This component is primarily for display

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
        <p className="text-muted-foreground">
          {translations.description}
        </p>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(healthStatus.status)}
            {translations.systemHealth.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Overall Status</span>
            <StatusBadge status={healthStatus.status}>
              {translations.systemHealth[healthStatus.status]}
            </StatusBadge>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>{translations.alerts.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus.alerts.length === 0
            ? (
                <p className="text-muted-foreground">{translations.alerts.noAlerts}</p>
              )
            : (
                <div className="space-y-3">
                  {healthStatus.alerts.map(alert => (
                    <Alert key={alert.id} variant="default" className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">{alert.type}</AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
        </CardContent>
      </Card>

      {/* Payment Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.metrics.totalPayments}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAttempts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All payment attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.metrics.successfulPayments}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.successfulPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.metrics.failedPayments}</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Failed or declined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.metrics.successRate}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              'text-2xl font-bold',
              metrics.successRate >= 0.95 && 'text-green-600',
              metrics.successRate >= 0.8 && metrics.successRate < 0.95 && 'text-yellow-600',
              metrics.successRate < 0.8 && 'text-red-600',
            )}
            >
              {(metrics.successRate * 100).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success ratio
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
