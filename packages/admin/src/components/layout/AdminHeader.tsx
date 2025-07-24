/**
 * Admin Header Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { AdminHeaderProps } from './types';
import { Bell, ExternalLink, LogOut, Settings, User } from 'lucide-react';

// Temporary simplified components until UI dependencies are resolved
const Button = ({ children, className = '', variant = 'default', size = 'default', onClick, ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} onClick={onClick} {...props}>
    {children}
  </button>
);

// Import and use icons as components to avoid type issues
const MenuIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

const Badge = ({ children, className = '', variant = 'default', ...props }: any) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`} {...props}>
    {children}
  </span>
);

const DropdownMenu = ({ children }: any) => <div className="relative inline-block">{children}</div>;
const DropdownMenuTrigger = ({ children }: any) => children;
const DropdownMenuContent = ({ children, className = '' }: any) => (
  <div className={`absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${className}`}>
    {children}
  </div>
);
const DropdownMenuItem = ({ children, className = '', onClick }: any) => (
  <div className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${className}`} onClick={onClick}>
    {children}
  </div>
);
const DropdownMenuLabel = ({ children }: any) => <div className="px-4 py-2 text-sm font-medium text-gray-900">{children}</div>;
const DropdownMenuSeparator = () => <div className="border-t border-gray-100" />;

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

type AdminHeaderComponentProps = {
  locale?: string;
  translations: {
    title: string;
    description: string;
    notifications: {
      label: string;
      unread: string;
    };
    settings: {
      label: string;
    };
    userMenu: {
      label: string;
      admin: string;
      myAccount: string;
      profile: string;
      settings: string;
      signOut: string;
    };
  };
} & AdminHeaderProps;

export function AdminHeader({
  className,
  title,
  description,
  notificationCount = 0,
  onSignOut,
  onMenuClick,
  locale = 'en',
  translations,
}: AdminHeaderComponentProps) {
  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    } else {
      try {
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
        });

        // Redirect to sign in page with locale preservation
        if (typeof window !== 'undefined') {
          window.location.href = `/${locale}/sign-in`;
        }
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    }
  };

  return (
    <header className={cn('border-b bg-background px-6 py-4 flex items-center justify-between', className)}>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden mr-4"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </Button>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {title || translations.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {description || translations.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                window.open(`${siteUrl}/${locale}`, '_blank');
              }
            }}
            aria-label="Return to main site"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to Site</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          aria-label={translations.notifications.label}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              aria-label={translations.notifications.unread}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          aria-label={translations.settings.label}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
              aria-label={translations.userMenu.label}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">{translations.userMenu.admin}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{translations.userMenu.myAccount}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              {translations.userMenu.profile}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              {translations.userMenu.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              {translations.userMenu.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
