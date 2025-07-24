/**
 * Mobile Optimizations Component
 * 移动端优化组件 - 提供移动设备的优化体验和响应式布局
 */

'use client';

import {
  ChevronDown,
  ChevronUp,
  Filter,
  Menu,
  Search,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', disabled, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Hook for responsive breakpoints
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return {
    breakpoint,
    windowSize,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}

// Mobile navigation component
type MobileNavigationProps = {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function MobileNavigation({ isOpen, onToggle, children }: MobileNavigationProps) {
  const { isMobileOrTablet } = useResponsive();

  if (!isMobileOrTablet) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="lg:hidden"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onToggle} />
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <Button onClick={onToggle} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible section for mobile
type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isMobile } = useResponsive();

  // On desktop, always show content
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-muted/50 flex items-center justify-between text-left hover:bg-muted/70 transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        {isOpen
          ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )
          : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// Mobile-optimized data table
type MobileDataTableProps = {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
    hideOnMobile?: boolean;
    priority?: 'high' | 'medium' | 'low';
  }[];
  onRowClick?: (item: any) => void;
  isLoading?: boolean;
};

export function MobileDataTable({
  data,
  columns,
  onRowClick,
  isLoading = false,
}: MobileDataTableProps) {
  const { isMobile, isTablet } = useResponsive();
  const [viewMode] = useState<'list' | 'grid'>('list');

  // Filter columns based on screen size
  const visibleColumns = columns.filter((col) => {
    if (isMobile) {
      return col.priority === 'high' || !col.hideOnMobile;
    }
    if (isTablet) {
      return col.priority !== 'low';
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              'bg-card border border-border rounded-lg p-4 space-y-2',
              onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
            )}
            onClick={() => onRowClick?.(item)}
          >
            {visibleColumns.map(column => (
              <div key={column.key} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">
                  {column.label}
                  :
                </span>
                <span className="text-sm text-foreground text-right flex-1 ml-2">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isTablet && viewMode === 'grid') {
    // Tablet grid view
    return (
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              'bg-card border border-border rounded-lg p-4 space-y-2',
              onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
            )}
            onClick={() => onRowClick?.(item)}
          >
            {visibleColumns.slice(0, 4).map(column => (
              <div key={column.key}>
                <div className="text-xs text-muted-foreground">
                  {column.label}
                </div>
                <div className="text-sm text-foreground">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default table view for tablet/desktop
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {visibleColumns.map(column => (
              <th key={column.key} className="text-left p-3 text-sm font-medium text-muted-foreground">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                'border-b border-border last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
              )}
              onClick={() => onRowClick?.(item)}
            >
              {visibleColumns.map(column => (
                <td key={column.key} className="p-3 text-sm text-foreground">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Touch-friendly action menu
type TouchActionMenuProps = {
  items: {
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }[];
  trigger: React.ReactNode;
};

export function TouchActionMenu({ items, trigger }: TouchActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobileOrTablet } = useResponsive();

  if (!isMobileOrTablet) {
    // Desktop dropdown
    return (
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </button>
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-48 z-10">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2',
                  item.variant === 'destructive' ? 'text-destructive' : '',
                  item.disabled ? 'opacity-50 cursor-not-allowed' : '',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Mobile bottom sheet
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        {trigger}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border rounded-t-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Actions</h3>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {items.map((item, index) => (
              <Button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                variant={item.variant === 'destructive' ? 'destructive' : 'outline'}
                className="w-full justify-start gap-2 h-12"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// Mobile search and filters
type MobileSearchFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: React.ReactNode;
  onClearFilters?: () => void;
};

export function MobileSearchFilters({
  searchValue,
  onSearchChange,
  filters,
  onClearFilters,
}: MobileSearchFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filters}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-base"
        />
      </div>

      {/* Filters toggle */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          variant="outline"
          className="gap-2 flex-1"
        >
          <Filter className="h-4 w-4" />
          Filters
          {isFiltersOpen
            ? (
                <ChevronUp className="h-4 w-4 ml-auto" />
              )
            : (
                <ChevronDown className="h-4 w-4 ml-auto" />
              )}
        </Button>

        {onClearFilters && (
          <Button onClick={onClearFilters} variant="ghost" size="sm">
            Clear
          </Button>
        )}
      </div>

      {/* Filters panel */}
      {isFiltersOpen && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
          {filters}
        </div>
      )}
    </div>
  );
}

// Responsive layout wrapper
type ResponsiveLayoutProps = {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ResponsiveLayout({
  sidebar,
  header,
  children,
  className,
}: ResponsiveLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isMobileOrTablet } = useResponsive();

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {header && (
        <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            {isMobileOrTablet && sidebar && (
              <Button
                onClick={() => setIsSidebarOpen(true)}
                variant="ghost"
                size="sm"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 bg-card border-r border-border">
              {sidebar}
            </aside>

            {/* Mobile sidebar */}
            {isMobileOrTablet && isSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="fixed inset-0 bg-black/50"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
                  <div className="p-4 border-b border-border">
                    <Button
                      onClick={() => setIsSidebarOpen(false)}
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {sidebar}
                </aside>
              </div>
            )}
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Touch-friendly pagination
type TouchPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function TouchPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: TouchPaginationProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Simplified mobile pagination
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="outline"
          className="gap-2"
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentPage}
          {' '}
          of
          {totalPages}
        </span>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="outline"
          className="gap-2"
        >
          Next
        </Button>
      </div>
    );
  }

  // Desktop pagination with page numbers
  const visiblePages = Math.min(5, totalPages);
  const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const endPage = Math.min(totalPages, startPage + visiblePages - 1);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        variant="outline"
        size="sm"
      >
        Previous
      </Button>

      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
        const page = startPage + i;
        return (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            className="min-w-[2.5rem]"
          >
            {page}
          </Button>
        );
      })}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        variant="outline"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}

// Device preview component for testing
type DevicePreviewProps = {
  children: React.ReactNode;
};

export function DevicePreview({ children }: DevicePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  const deviceSizes = {
    mobile: 'w-[375px] h-[667px]',
    tablet: 'w-[768px] h-[1024px]',
    desktop: 'w-full h-full',
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Preview controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPreviewMode('mobile')}
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Menu className="h-4 w-4" />
              Mobile
            </Button>
            <Button
              onClick={() => setPreviewMode('tablet')}
              variant={previewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Tablet
            </Button>
            <Button
              onClick={() => setPreviewMode('desktop')}
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Desktop
            </Button>
          </div>

          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isFullscreen
              ? (
                  <X className="h-4 w-4" />
                )
              : (
                  <Menu className="h-4 w-4" />
                )}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Preview content */}
      <div className={cn(
        'mx-auto bg-white dark:bg-gray-900',
        isFullscreen ? 'w-full h-full' : 'p-8',
        !isFullscreen && previewMode !== 'desktop' ? deviceSizes[previewMode] : '',
        !isFullscreen && previewMode !== 'desktop' ? 'border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden' : '',
      )}
      >
        {children}
      </div>
    </div>
  );
}
