/**
 * Loading Skeletons Component
 * 加载骨架屏组件 - 优化用户体验的加载状态显示
 */

'use client';

import React from 'react';

// Temporary simplified components
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Base skeleton component
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-muted',
      className,
    )}
    {...props}
  />
);

// Overview skeleton
export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>

      {/* Status Banner */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Order sync panel skeleton
export function OrderSyncSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-2 border-b border-border">
            {['Order ID', 'Customer', 'Amount', 'Status', 'Last Attempt', 'Actions'].map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 py-3 border-b border-border last:border-b-0">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inventory manager skeleton
export function InventorySkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-full" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sync logs skeleton
export function SyncLogsSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>

      {/* Logs */}
      <div className="p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-18" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Health monitor skeleton
export function HealthMonitorSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Metrics Grid */}
        <div>
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-3" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <Skeleton className="h-4 w-28 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Combined loading skeleton for the entire Shopify page
export function ShopifyPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Overview Section */}
        <section>
          <Skeleton className="h-6 w-32 mb-4" />
          <OverviewSkeleton />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section>
              <Skeleton className="h-6 w-40 mb-4" />
              <OrderSyncSkeleton />
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <Skeleton className="h-6 w-36 mb-4" />
              <InventorySkeleton />
            </section>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section>
            <Skeleton className="h-6 w-28 mb-4" />
            <SyncLogsSkeleton />
          </section>

          <section>
            <Skeleton className="h-6 w-44 mb-4" />
            <HealthMonitorSkeleton />
          </section>
        </div>
      </div>
    </div>
  );
}

// Loading overlay component
export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  className,
}: {
  isVisible: boolean;
  message?: string;
  className?: string;
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
      className,
    )}
    >
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-6 py-4 shadow-lg">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-sm font-medium text-foreground">{message}</span>
      </div>
    </div>
  );
}

// Inline loading spinner
export function LoadingSpinner({
  size = 'sm',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn(
      'animate-spin border-2 border-current border-t-transparent rounded-full',
      sizeClasses[size],
      className,
    )}
    />
  );
}

// Smart loading wrapper that shows skeleton or content
export function LoadingWrapper({
  isLoading,
  skeleton,
  children,
  loadingMessage,
  className,
}: {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  loadingMessage?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {isLoading ? skeleton : children}
      <LoadingOverlay
        isVisible={isLoading && !!loadingMessage}
        message={loadingMessage}
      />
    </div>
  );
}
