/**
 * Health Monitor Component
 * 健康监控组件 - Shopify API 连接状态、服务健康指标和实时监控
 */

'use client';

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Database,
  ExternalLink,
  Info,
  RefreshCw,
  Server,
  Settings,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
type HealthMetric = {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: string;
  description: string;
  lastCheck: string;
  responseTime?: number;
  uptime?: number;
  errorRate?: number;
  trend?: { value: number; type: 'increase' | 'decrease' | 'stable' };
};

type ServiceStatus = {
  service: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  lastCheck: string;
  incidents?: number;
};

type HealthMonitorProps = {
  className?: string;
};

export function HealthMonitor({ className }: HealthMonitorProps) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([
    {
      id: 'shopify-api',
      name: 'Shopify API',
      status: 'healthy',
      value: '200ms',
      description: 'API response time',
      lastCheck: '30 seconds ago',
      responseTime: 200,
      uptime: 99.95,
      errorRate: 0.02,
      trend: { value: 5, type: 'decrease' },
    },
    {
      id: 'database',
      name: 'Database Connection',
      status: 'healthy',
      value: '99.9%',
      description: 'Connection uptime',
      lastCheck: '1 minute ago',
      responseTime: 15,
      uptime: 99.9,
      errorRate: 0.01,
      trend: { value: 2, type: 'increase' },
    },
    {
      id: 'webhook-processing',
      name: 'Webhook Processing',
      status: 'warning',
      value: '98.5%',
      description: 'Processing success rate',
      lastCheck: '2 minutes ago',
      responseTime: 500,
      uptime: 98.5,
      errorRate: 1.5,
      trend: { value: 3, type: 'decrease' },
    },
    {
      id: 'sync-service',
      name: 'Sync Service',
      status: 'healthy',
      value: 'Active',
      description: 'Background sync status',
      lastCheck: '45 seconds ago',
      responseTime: 100,
      uptime: 99.8,
      errorRate: 0.05,
      trend: { value: 0, type: 'stable' },
    },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      service: 'Shopify Admin API',
      status: 'online',
      responseTime: 180,
      lastCheck: '30 seconds ago',
      incidents: 0,
    },
    {
      service: 'Shopify Storefront API',
      status: 'online',
      responseTime: 220,
      lastCheck: '1 minute ago',
      incidents: 0,
    },
    {
      service: 'Webhook Endpoints',
      status: 'degraded',
      responseTime: 800,
      lastCheck: '2 minutes ago',
      incidents: 1,
    },
    {
      service: 'Authentication Service',
      status: 'online',
      responseTime: 95,
      lastCheck: '45 seconds ago',
      incidents: 0,
    },
  ]);

  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!isAutoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      // Simulate real-time updates
      setHealthMetrics(prev => prev.map(metric => ({
        ...metric,
        responseTime: metric.responseTime && metric.responseTime + Math.random() * 20 - 10,
        lastCheck: 'Just now',
      })));

      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: service.responseTime + Math.random() * 50 - 25,
        lastCheck: 'Just now',
      })));

      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const getStatusIcon = (status: HealthMetric['status'] | ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: HealthMetric['status'] | ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
      case 'degraded':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'critical':
      case 'offline':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'maintenance':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getTrendIcon = (trend?: HealthMetric['trend']) => {
    if (!trend || trend.type === 'stable') {
      return null;
    }
    return trend.type === 'increase'
      ? (
          <TrendingUp className="h-3 w-3 text-green-600" />
        )
      : (
          <TrendingDown className="h-3 w-3 text-red-600" />
        );
  };

  const overallStatus = (): 'healthy' | 'warning' | 'critical' => {
    const hasCritical = healthMetrics.some(m => m.status === 'critical') || services.some(s => s.status === 'offline');
    const hasWarning = healthMetrics.some(m => m.status === 'warning') || services.some(s => s.status === 'degraded');

    if (hasCritical) {
      return 'critical';
    }
    if (hasWarning) {
      return 'warning';
    }
    return 'healthy';
  };

  const handleRefresh = () => {
    // Simulate manual refresh
    setHealthMetrics(prev => prev.map(metric => ({
      ...metric,
      lastCheck: 'Just now',
    })));
    setServices(prev => prev.map(service => ({
      ...service,
      lastCheck: 'Just now',
    })));
    setLastUpdate(new Date());
  };

  const status = overallStatus();

  return (
    <div className={cn('bg-card border-2 rounded-lg', getStatusColor(status), className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <h2 className="text-lg font-semibold text-foreground">
                System Health Monitor
              </h2>
            </div>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium border',
              getStatusColor(status),
            )}
            >
              {status === 'healthy' && 'All Systems Operational'}
              {status === 'warning' && 'Some Issues Detected'}
              {status === 'critical' && 'Critical Issues'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>
                Last updated:
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={cn(
                'gap-2',
                isAutoRefresh ? 'text-green-600 border-green-200' : '',
              )}
            >
              {isAutoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              Auto Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Core Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map(metric => (
              <div
                key={metric.id}
                className="bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium text-foreground">
                      {metric.name}
                    </span>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.lastCheck}
                  </div>
                </div>

                {(metric.uptime || metric.errorRate) && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {metric.uptime && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="text-foreground font-medium">
                          {metric.uptime}
                          %
                        </span>
                      </div>
                    )}
                    {metric.errorRate !== undefined && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Error Rate:</span>
                        <span className="text-foreground font-medium">
                          {metric.errorRate}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Services Status */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Server className="h-4 w-4" />
            Service Status
          </h3>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {service.service}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Response time:
                      {' '}
                      {Math.round(service.responseTime)}
                      ms
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      getStatusColor(service.status),
                    )}
                    >
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {service.lastCheck}
                    </div>
                  </div>

                  {service.incidents !== undefined && service.incidents > 0 && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                      {service.incidents}
                      {' '}
                      incident
                      {service.incidents !== 1 ? 's' : ''}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <Database className="h-4 w-4" />
              Test Database
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <Server className="h-4 w-4" />
              Check APIs
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <RefreshCw className="h-4 w-4" />
              Restart Services
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              View Logs
            </Button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">System Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <span className="ml-2 text-foreground font-medium">Production</span>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <span className="ml-2 text-foreground font-medium">v1.2.3</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deployed:</span>
              <span className="ml-2 text-foreground font-medium">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
