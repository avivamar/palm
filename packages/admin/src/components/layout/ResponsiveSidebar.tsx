/**
 * Responsive Sidebar Component
 * 响应式侧边栏组件 - 支持展开/收起和移动端适配
 */

'use client';

import type { AdminLayoutTranslations } from './types';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Dot,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Terminal,
  Users,
} from 'lucide-react';
import { CompatLink as Link } from '../ui/CompatLink';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useLayout } from './AdminLayout';

// Temporary simplified components
const Badge = ({ children, className = '', variant = 'default', ...props }: any) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 ${className}`} {...props}>
    {children}
  </span>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  badge?: string;
  children?: NavigationItem[];
};

type ResponsiveSidebarProps = {
  locale: string;
  translations: AdminLayoutTranslations['navigation'];
  className?: string;
};

export function ResponsiveSidebar({ locale, translations, className }: ResponsiveSidebarProps) {
  const { sidebarOpen, sidebarCollapsed, isMobile, closeSidebar } = useLayout();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Close sidebar when clicking on link (mobile only)
  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // Toggle expanded state for menu items with children
  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  // Navigation items structure
  const navigationItems: NavigationItem[] = [
    {
      title: translations.dashboard,
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      title: translations.monitoring,
      href: `/${locale}/admin/monitoring`,
      icon: Activity,
      disabled: false,
    },
    {
      title: translations.users,
      href: `/${locale}/admin/users`,
      icon: Users,
      disabled: false,
    },
    {
      title: translations.scripts,
      href: `/${locale}/admin/scripts`,
      icon: Terminal,
      disabled: false,
    },
    {
      title: 'E-commerce',
      href: `/${locale}/admin/ecommerce`,
      icon: Store,
      disabled: false,
      children: [
        {
          title: translations.shopify,
          href: `/${locale}/admin/shopify`,
          icon: Store,
          disabled: false,
        },
        {
          title: translations.orders,
          href: `/${locale}/admin/orders`,
          icon: ShoppingCart,
          disabled: true,
        },
        {
          title: translations.products,
          href: `/${locale}/admin/products`,
          icon: Package,
          disabled: true,
        },
      ],
    },
    {
      title: translations.analytics,
      href: `/${locale}/admin/analytics`,
      icon: BarChart3,
      disabled: true,
    },
    {
      title: translations.settings,
      href: `/${locale}/admin/settings`,
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <aside
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out',
        isMobile
          ? 'fixed inset-y-0 left-0 z-30 w-64 transform'
          : 'relative',
        isMobile && !sidebarOpen ? '-translate-x-full' : '',
        !isMobile && sidebarCollapsed ? 'w-16' : '',
        !isMobile && !sidebarCollapsed ? 'w-64' : '',
        className,
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <SidebarHeader
        title={translations.title}
        collapsed={sidebarCollapsed && !isMobile}
      />

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1" role="list">
          {navigationItems.map(item => (
            <NavigationMenuItem
              key={item.href}
              item={item}
              collapsed={sidebarCollapsed && !isMobile}
              expanded={expandedItems.has(item.href)}
              onToggleExpanded={() => toggleExpanded(item.href)}
              onLinkClick={handleLinkClick}
              translations={translations}
            />
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <SidebarFooter
        version={translations.version}
        collapsed={sidebarCollapsed && !isMobile}
      />
    </aside>
  );
}

type SidebarHeaderProps = {
  title: string;
  collapsed: boolean;
};

function SidebarHeader({ title, collapsed }: SidebarHeaderProps) {
  return (
    <div className="flex items-center h-16 px-4 border-b border-border">
      <div className={cn(
        'transition-all duration-200',
        collapsed ? 'opacity-0 w-0' : 'opacity-100 w-full',
      )}
      >
        <h1 className="text-lg font-semibold text-foreground truncate">
          {title}
        </h1>
      </div>

      {collapsed && (
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
          <span className="text-sm font-bold text-primary-foreground">R</span>
        </div>
      )}
    </div>
  );
}

type SidebarFooterProps = {
  version: string;
  collapsed: boolean;
};

function SidebarFooter({ version, collapsed }: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-border">
      <div className={cn(
        'transition-all duration-200',
        collapsed ? 'opacity-0' : 'opacity-100',
      )}
      >
        <p className="text-xs text-muted-foreground">
          {version.replace('{version}', '1.0.0')}
        </p>
      </div>
    </div>
  );
}

type NavigationMenuItemProps = {
  item: NavigationItem;
  collapsed: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onLinkClick: () => void;
  translations: AdminLayoutTranslations['navigation'];
  level?: number;
};

function NavigationMenuItem({
  item,
  collapsed,
  expanded,
  onToggleExpanded,
  onLinkClick,
  translations,
  level = 0,
}: NavigationMenuItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  // Check if current item or any child is active
  const isActive = pathname === item.href
    || (item.href !== `/${pathname.split('/')[1]}/admin` && pathname.includes(item.href.replace(`/${pathname.split('/')[1]}`, '')))
    || (hasChildren && item.children?.some(child =>
      pathname === child.href || pathname.includes(child.href.replace(`/${pathname.split('/')[1]}`, '')),
    ));

  const itemContent = (
    <>
      <Icon
        className={cn(
          'h-5 w-5 flex-shrink-0',
          level > 0 ? 'ml-1' : '',
        )}
        aria-hidden="true"
      />

      <span className={cn(
        'flex-1 transition-all duration-200',
        collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3',
      )}
      >
        {item.title}
      </span>

      {/* Badge for disabled items */}
      {item.disabled && !collapsed && (
        <Badge variant="secondary" className="text-xs ml-2">
          {translations.soon}
        </Badge>
      )}

      {/* Expand/collapse indicator for items with children */}
      {hasChildren && !collapsed && (
        <div className="ml-auto">
          {expanded
            ? (
                <ChevronDown className="h-4 w-4" />
              )
            : (
                <ChevronRight className="h-4 w-4" />
              )}
        </div>
      )}
    </>
  );

  return (
    <li role="listitem">
      {item.disabled ? (
        <div
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed rounded-md',
            level > 0 ? 'ml-4 pl-2' : '',
          )}
          aria-disabled="true"
          role="button"
          tabIndex={-1}
        >
          {itemContent}
        </div>
      ) : hasChildren ? (
        <>
          <button
            onClick={onToggleExpanded}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              level > 0 ? 'ml-4 pl-2' : '',
            )}
            aria-expanded={expanded}
            aria-current={isActive ? 'page' : undefined}
          >
            {itemContent}
          </button>

          {/* Submenu */}
          {expanded && !collapsed && item.children && (
            <ul className="mt-1 space-y-1 ml-4" role="list">
              {item.children.map(child => (
                <NavigationMenuItem
                  key={child.href}
                  item={child}
                  collapsed={false}
                  expanded={false}
                  onToggleExpanded={() => {}}
                  onLinkClick={onLinkClick}
                  translations={translations}
                  level={level + 1}
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          href={item.href}
          onClick={onLinkClick}
          className={cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            level > 0 ? 'ml-4 pl-2' : '',
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          {level > 0
            ? (
                <Dot className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              )
            : (
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              )}

          <span className={cn(
            'transition-all duration-200',
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 ml-3',
          )}
          >
            {item.title}
          </span>
        </Link>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && !hasChildren && (
        <div className="absolute left-16 bg-popover border border-border rounded-md shadow-md px-2 py-1 text-sm text-popover-foreground opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {item.title}
        </div>
      )}
    </li>
  );
}
