/**
 * Admin Sidebar Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { AdminSidebarProps, SidebarItem } from './types';
import { cn } from '../../lib/utils';
import {
  Activity,
  BarChart3,
  Brain,
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
import { Badge } from '@/components/ui';

type AdminSidebarComponentProps = {
  translations: {
    title: string;
    dashboard: string;
    monitoring: string;
    users: string;
    scripts: string;
    shopify: string;
    ai: string;
    orders: string;
    products: string;
    analytics: string;
    settings: string;
    soon: string;
    version: string;
  };
} & AdminSidebarProps;

export function AdminSidebar({ className, locale = 'en', translations }: AdminSidebarComponentProps) {
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
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
      title: translations.shopify,
      href: `/${locale}/admin/shopify`,
      icon: Store,
      disabled: false,
    },
    {
      title: translations.ai,
      href: `/${locale}/admin/ai`,
      icon: Brain,
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
    <aside className={cn('fixed inset-y-0 left-0 z-50 w-64 bg-background border-r min-h-screen flex flex-col lg:static lg:inset-0', className)} role="navigation" aria-label="Admin navigation">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">{translations.title}</h2>
      </div>

      <nav className="flex-1 p-3" aria-label="Main navigation">
        <ul className="space-y-1" role="list">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${locale}/admin` && pathname.includes(item.href.replace(`/${locale}`, '')));
            const Icon = item.icon;

            return (
              <li key={item.href} role="listitem">
                {item.disabled
                  ? (
                      <div
                        className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed rounded-md"
                        aria-disabled="true"
                        role="button"
                        tabIndex={-1}
                      >
                        <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                        <span className="flex-1">{item.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {translations.soon}
                        </Badge>
                      </div>
                    )
                  : (
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                        {item.title}
                      </Link>
                    )}
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="p-4 border-t bg-muted/10">
        <p className="text-xs text-muted-foreground">{translations.version.replace('{version}', '1.0.0')}</p>
      </footer>
    </aside>
  );
}
