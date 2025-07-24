/**
 * Mobile Navigation Component
 * 移动端导航组件 - 为移动设备优化的导航体验
 */

'use client';

import type { AdminLayoutTranslations } from './types';
import {
  Activity,
  Bell,
  ChevronRight,
  Home,
  Menu,
  Search,
  Settings,
  Store,
  Users,
  X,
} from 'lucide-react';
import { CompatLink as Link } from '../ui/CompatLink';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useLayout } from './AdminLayout';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type MobileNavigationProps = {
  locale: string;
  translations: AdminLayoutTranslations;
  className?: string;
};

export function MobileNavigation({ locale, translations, className }: MobileNavigationProps) {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useLayout();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Quick action items for mobile
  const quickActions = [
    {
      title: translations.navigation.dashboard,
      href: `/${locale}/admin`,
      icon: Home,
    },
    {
      title: translations.navigation.monitoring,
      href: `/${locale}/admin/monitoring`,
      icon: Activity,
    },
    {
      title: translations.navigation.users,
      href: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      title: translations.navigation.shopify,
      href: `/${locale}/admin/shopify`,
      icon: Store,
    },
    {
      title: translations.navigation.settings,
      href: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={cn('lg:hidden bg-background border-b border-border', className)}>
        <div className="flex items-center justify-between h-14 px-4">
          {/* Menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo/Title */}
          <h1 className="font-semibold text-lg truncate">
            {translations.navigation.title}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="px-4 pb-3 border-b border-border">
            <MobileSearchBar onClose={() => setSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Navigation Overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Navigation Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-background border-r border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <MobileNavigationPanel
              locale={locale}
              translations={translations}
              onClose={closeSidebar}
            />
          </div>
        </>
      )}

      {/* Bottom Navigation Bar (for very small screens) */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border lg:hidden sm:hidden">
        <div className="flex items-center justify-around h-16">
          {quickActions.slice(0, 4).map((action) => {
            const isActive = pathname === action.href;
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full flex-1 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 truncate">{action.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

type MobileSearchBarProps = {
  onClose: () => void;
};

function MobileSearchBar({ onClose }: MobileSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          type="search"
          placeholder="Search admin panel..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-4 pr-10 rounded-md border border-input bg-background text-sm"
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Close search"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

type MobileNavigationPanelProps = {
  locale: string;
  translations: AdminLayoutTranslations;
  onClose: () => void;
};

function MobileNavigationPanel({ locale, translations, onClose }: MobileNavigationPanelProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: translations.navigation.dashboard,
      href: `/${locale}/admin`,
      icon: Home,
      disabled: false,
    },
    {
      title: translations.navigation.monitoring,
      href: `/${locale}/admin/monitoring`,
      icon: Activity,
      disabled: false,
    },
    {
      title: translations.navigation.users,
      href: `/${locale}/admin/users`,
      icon: Users,
      disabled: false,
    },
    {
      title: translations.navigation.shopify,
      href: `/${locale}/admin/shopify`,
      icon: Store,
      disabled: false,
    },
    {
      title: translations.navigation.settings,
      href: `/${locale}/admin/settings`,
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {translations.navigation.title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-4" role="list">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href} role="listitem">
                {item.disabled
                  ? (
                      <div
                        className="flex items-center justify-between px-4 py-3 text-muted-foreground cursor-not-allowed"
                        aria-disabled="true"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {translations.navigation.soon}
                        </span>
                      </div>
                    )
                  : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Administrator</p>
            <p className="text-xs text-muted-foreground">admin@rolitt.com</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            <X className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Version */}
      <div className="px-4 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {translations.navigation.version.replace('{version}', '1.0.0')}
        </p>
      </div>
    </div>
  );
}
