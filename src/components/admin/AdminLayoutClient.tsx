/**
 * Admin Layout Client Component
 * Handles mobile sidebar state management
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import { AdminHeader, AdminSidebar } from '@rolitt/admin';
import { useState } from 'react';

type AdminLayoutClientProps = {
  locale: string;
  translations: {
    header: {
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
    navigation: {
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
  };
  children: React.ReactNode;
};

export function AdminLayoutClient({ locale, translations, children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        locale={locale}
        translations={translations.navigation}
        className={`transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      />

      <div className="lg:pl-64">
        <AdminHeader
          title={translations.header.title}
          description={translations.header.description}
          notificationCount={3}
          locale={locale}
          translations={translations.header}
          onMenuClick={toggleSidebar}
        />

        <main
          id="main-content"
          className="p-4 sm:p-6 lg:p-8"
          role="main"
          aria-label="Admin dashboard content"
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
