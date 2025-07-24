/**
 * Admin Layout Client Component - Modernized
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { AdminLayoutTranslations } from './layout/types';
import React from 'react';
import { AdminLayout } from './layout/AdminLayout';
import { ContentArea } from './layout/ContentArea';
import { MobileNavigation } from './layout/MobileNavigation';
import { ResponsiveSidebar } from './layout/ResponsiveSidebar';
import { TopNavigation } from './layout/TopNavigation';

type AdminLayoutClientProps = {
  locale: string;
  translations: AdminLayoutTranslations;
  children: React.ReactNode;
};

export function AdminLayoutClient({
  locale,
  translations,
  children,
}: AdminLayoutClientProps) {
  return (
    <AdminLayout locale={locale} translations={translations}>
      {/* Mobile Navigation */}
      <MobileNavigation locale={locale} translations={translations} />

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Sidebar */}
        <ResponsiveSidebar locale={locale} translations={translations.navigation} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation */}
          <TopNavigation translations={translations.header} />

          {/* Main content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-background"
          >
            <ContentArea maxWidth="full" padding="lg">
              {children}
            </ContentArea>
          </main>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden pt-14 pb-16">
        <main id="main-content-mobile" className="min-h-screen bg-background">
          <ContentArea maxWidth="full" padding="md">
            {children}
          </ContentArea>
        </main>
      </div>
    </AdminLayout>
  );
}
