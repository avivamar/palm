/**
 * Top Navigation Component
 * 顶部导航栏组件 - 包含面包屑、搜索、通知和用户菜单
 */

'use client';

import type { AdminLayoutTranslations } from './types';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useLayout } from './AdminLayout';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type TopNavigationProps = {
  translations: AdminLayoutTranslations['header'];
  className?: string;
};

export function TopNavigation({ translations, className }: TopNavigationProps) {
  const { toggleSidebar, isMobile } = useLayout();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // In a real implementation, this would update the theme context/localStorage
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className={cn(
      'h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20',
      className,
    )}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Breadcrumbs */}
        <BreadcrumbNavigation />

        {/* Search (on larger screens) */}
        <div className="hidden md:block flex-1 max-w-md ml-4">
          <SearchBar />
        </div>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light'
            ? (
                <Moon className="h-4 w-4" />
              )
            : (
                <Sun className="h-4 w-4" />
              )}
        </Button>

        {/* Notifications */}
        <NotificationButton translations={translations} />

        {/* User menu */}
        <UserMenu translations={translations} />
      </div>
    </header>
  );
}

function BreadcrumbNavigation() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Remove locale from path segments
  const segments = pathSegments.slice(1); // Remove locale

  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    };
  });

  // Add home breadcrumb
  const homeBreadcrumb = {
    href: `/${pathSegments[0]}/admin`,
    label: 'Dashboard',
    isLast: segments.length === 1,
  };

  const allBreadcrumbs = segments.length > 1 ? [homeBreadcrumb, ...breadcrumbs] : [homeBreadcrumb];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Home className="h-4 w-4" />

      {allBreadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.href}>
          {index > 0 && <ChevronRight className="h-3 w-3" />}

          {breadcrumb.isLast
            ? (
                <span className="font-medium text-foreground">
                  {breadcrumb.label}
                </span>
              )
            : (
                <a
                  href={breadcrumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {breadcrumb.label}
                </a>
              )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search admin panel..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="pl-10 pr-4 w-full"
        />
      </div>

      {/* Search dropdown would go here */}
      {isSearchFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="text-sm text-muted-foreground">
              Search results for "
              {searchQuery}
              "
            </div>
            {/* Search results would be rendered here */}
          </div>
        </div>
      )}
    </div>
  );
}

type NotificationButtonProps = {
  translations: AdminLayoutTranslations['header'];
};

function NotificationButton({ translations }: NotificationButtonProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    // Explicit return for TypeScript when showNotifications is false
    return undefined;
  }, [showNotifications]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
        aria-label={translations.notifications.label.replace('{count}', notificationCount.toString())}
      >
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Button>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {translations.notifications.unread.replace('{count}', notificationCount.toString())}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Mock notifications */}
            {[1, 2, 3].map(id => (
              <div key={id} className="p-4 border-b border-border last:border-b-0 hover:bg-accent">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Order #1234 from customer@example.com
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type UserMenuProps = {
  translations: AdminLayoutTranslations['header'];
};

function UserMenu({ translations }: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    // Explicit return for TypeScript when showUserMenu is false
    return undefined;
  }, [showUserMenu]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2"
        aria-label={translations.userMenu.label}
      >
        <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
          <User className="h-3 w-3 text-primary-foreground" />
        </div>
        <span className="hidden sm:block text-sm">Admin</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {/* User menu dropdown */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-sm">Administrator</p>
            <p className="text-xs text-muted-foreground">admin@rolitt.com</p>
          </div>

          <div className="py-2">
            <UserMenuItem icon={User} label={translations.userMenu.profile} />
            <UserMenuItem icon={Settings} label={translations.userMenu.settings} />
          </div>

          <div className="py-2 border-t border-border">
            <UserMenuItem
              icon={LogOut}
              label={translations.userMenu.signOut}
              className="text-destructive hover:text-destructive"
            />
          </div>
        </div>
      )}
    </div>
  );
}

type UserMenuItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
  onClick?: () => void;
};

function UserMenuItem({ icon: Icon, label, className, onClick }: UserMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-accent transition-colors',
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
