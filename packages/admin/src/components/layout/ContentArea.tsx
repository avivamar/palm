/**
 * Content Area Component
 * 内容区域组件 - 为管理页面内容提供标准化布局
 */

'use client';

import { ArrowUp, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type ContentAreaProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function ContentArea({
  children,
  className,
  maxWidth = 'full',
  padding = 'lg',
  loading = false,
  error = null,
  onRetry,
}: ContentAreaProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll to top button when scrolled down
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-4xl',
    'xl': 'max-w-6xl',
    '2xl': 'max-w-7xl',
    'full': 'max-w-full',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-4 lg:p-6',
  };

  // Error state
  if (error) {
    return (
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
      >
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn(
        'mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
      >
        <LoadingState />
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'mx-auto min-h-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
      >
        {children}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-foreground truncate lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

type SectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
};

export function Section({ title, description, children, className, headerActions }: SectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || description || headerActions) && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {headerActions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

type CardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export function Card({ title, description, children, className, headerActions, padding = 'lg' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={cn(
      'bg-card border border-border rounded-lg shadow-sm',
      className,
    )}
    >
      {(title || description || headerActions) && (
        <div className={cn(
          'border-b border-border',
          paddingClasses[padding],
          padding === 'none' ? 'p-6 pb-4' : 'pb-4',
        )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="font-semibold text-foreground truncate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>

            {headerActions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
}

type GridProps = {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Grid({ children, cols = 1, gap = 'md', className }: GridProps) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn(
      'grid',
      colsClasses[cols],
      gapClasses[gap],
      className,
    )}
    >
      {children}
    </div>
  );
}

type ErrorStateProps = {
  error: string;
  onRetry?: () => void;
};

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <div className="rounded-full bg-destructive/20 p-2">
          <div className="h-6 w-6 bg-destructive rounded-full" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 opacity-50">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}

      {action}
    </div>
  );
}
