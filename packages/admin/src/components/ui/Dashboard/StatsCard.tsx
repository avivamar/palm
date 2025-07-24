/**
 * Dashboard Components
 * 仪表板组件 - 统计卡片、图表容器和趋势指标
 */

'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  MoreHorizontal,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type StatsCardProps = {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
};

export function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  loading = false,
  className,
  onClick,
}: StatsCardProps) {
  const isClickable = !!onClick;

  const cardContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            {loading
              ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                )
              : (
                  <p className="text-2xl font-bold text-foreground">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                )}

            {change && !loading && (
              <div className="flex items-center gap-1">
                {change.type === 'increase' && (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
                {change.type === 'decrease' && (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                {change.type === 'neutral' && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}

                <span className={cn(
                  'text-sm font-medium',
                  change.type === 'increase' ? 'text-green-600' : '',
                  change.type === 'decrease' ? 'text-red-600' : '',
                  change.type === 'neutral' ? 'text-muted-foreground' : '',
                )}
                >
                  {Math.abs(change.value)}
                  %
                </span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}

          {change?.period && !loading && (
            <p className="text-xs text-muted-foreground mt-1">
              vs
              {' '}
              {change.period}
            </p>
          )}
        </div>

        {icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full group',
          'hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className,
        )}
      >
        {cardContent}
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-2 opacity-0 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg p-6 shadow-sm',
      className,
    )}
    >
      {cardContent}
    </div>
  );
}

type ChartContainerProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
};

export function ChartContainer({
  title,
  description,
  children,
  className,
  actions,
  loading = false,
  error,
  onRefresh,
}: ChartContainerProps) {
  return (
    <div className={cn(
      'bg-card border border-border rounded-lg shadow-sm',
      className,
    )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh chart data"
              >
                <RefreshCw className={cn('h-4 w-4', loading ? 'animate-spin' : '')} />
              </Button>
            )}

            {actions}

            <Button variant="ghost" size="sm" aria-label="Chart options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error
          ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-destructive/10 p-3 mb-4">
                  <div className="h-6 w-6 bg-destructive rounded-full" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {error}
                </p>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    Try again
                  </Button>
                )}
              </div>
            )
          : loading
            ? (
                <ChartSkeleton />
              )
            : (
                children
              )}
      </div>
    </div>
  );
}

type MetricTrendProps = {
  title: string;
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percentage';
  currency?: string;
  className?: string;
  showTrend?: boolean;
  precision?: number;
};

export function MetricTrend({
  title,
  current,
  previous,
  format = 'number',
  currency = 'USD',
  className,
  showTrend = true,
  precision = 0,
}: MetricTrendProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const trend = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral';

  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(precision)}%`;
      default:
        return value.toLocaleString('en-US', {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        });
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-foreground">
          {formatValue(current)}
        </span>

        {showTrend && change !== 0 && (
          <div className="flex items-center gap-1">
            {trend === 'increase' && (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            )}
            {trend === 'decrease' && (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}

            <span className={cn(
              'text-sm font-medium',
              trend === 'increase' ? 'text-green-600' : '',
              trend === 'decrease' ? 'text-red-600' : '',
            )}
            >
              {Math.abs(change).toFixed(1)}
              %
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Previous:
        {' '}
        {formatValue(previous)}
      </p>
    </div>
  );
}

type DashboardGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6',
      className,
    )}
    >
      {children}
    </div>
  );
}

type QuickStatsProps = {
  stats: Array<{
    title: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease' | 'neutral';
    };
    icon?: React.ReactNode;
  }>;
  loading?: boolean;
  className?: string;
};

export function QuickStats({ stats, loading = false, className }: QuickStatsProps) {
  return (
    <DashboardGrid className={className}>
      {stats.map((stat, index) => (
        <StatsCard
          key={`${stat.title}-${index}`}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          loading={loading}
        />
      ))}
    </DashboardGrid>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* Chart area */}
      <div className="h-64 bg-muted animate-pulse rounded" />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
