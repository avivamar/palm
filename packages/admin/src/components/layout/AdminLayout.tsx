/**
 * Modern Admin Layout Component with Responsive Design
 * 现代化管理布局 - 支持响应式设计和可伸缩侧边栏
 */

'use client';

import type { AdminLayoutTranslations } from './types';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Layout Context for state management
type LayoutContextType = {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

type LayoutProviderProps = {
  children: React.ReactNode;
};

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        sidebarCollapsed,
        isMobile,
        toggleSidebar,
        closeSidebar,
        toggleCollapse,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

type AdminLayoutProps = {
  locale: string;
  translations: AdminLayoutTranslations;
  children: React.ReactNode;
};

export function AdminLayout({ locale, translations, children }: AdminLayoutProps) {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-background">
        <AdminLayoutInner locale={locale} translations={translations}>
          {children}
        </AdminLayoutInner>
      </div>
    </LayoutProvider>
  );
}

function AdminLayoutInner({ locale, translations, children }: AdminLayoutProps) {
  const { sidebarOpen, sidebarCollapsed, isMobile, closeSidebar } = useLayout();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <ResponsiveSidebar locale={locale} translations={translations.navigation} />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navigation */}
        <TopNavigation translations={translations.header} />

        {/* Main content */}
        <main
          id="main-content"
          className={`flex-1 overflow-y-auto bg-background transition-all duration-200 ease-in-out ${
            !isMobile && !sidebarCollapsed ? 'lg:pl-0' : ''
          }`}
        >
          <ContentArea>{children}</ContentArea>
        </main>
      </div>
    </div>
  );
}

type ResponsiveSidebarProps = {
  locale: string;
  translations: AdminLayoutTranslations['navigation'];
};

function ResponsiveSidebar({ locale, translations }: ResponsiveSidebarProps) {
  const { sidebarOpen, sidebarCollapsed, isMobile, toggleCollapse } = useLayout();

  // Don't render sidebar on mobile when closed
  if (isMobile && !sidebarOpen) {
    return null;
  }

  const sidebarWidth = sidebarCollapsed && !isMobile ? 'w-16' : 'w-64';
  const sidebarTransform = isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0';

  return (
    <aside
      className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${sidebarWidth}
        ${sidebarTransform}
        z-30 h-screen bg-card border-r border-border
        transition-all duration-300 ease-in-out
        flex flex-col
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className={`transition-opacity duration-200 ${sidebarCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-lg font-semibold text-foreground truncate">
            {translations.title}
          </h1>
        </div>

        {/* Collapse toggle for desktop */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed
              ? (
                  <ChevronRight className="h-4 w-4" />
                )
              : (
                  <ChevronLeft className="h-4 w-4" />
                )}
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <NavigationMenu
        locale={locale}
        translations={translations}
        collapsed={sidebarCollapsed && !isMobile}
      />

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <div className={`transition-opacity duration-200 ${sidebarCollapsed && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xs text-muted-foreground">
            {translations.version.replace('{version}', '1.0.0')}
          </p>
        </div>
      </div>
    </aside>
  );
}

type TopNavigationProps = {
  translations: AdminLayoutTranslations['header'];
};

function TopNavigation({ translations }: TopNavigationProps) {
  const { toggleSidebar, isMobile } = useLayout();

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumbs would go here */}
        <BreadcrumbTrail />
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle, notifications, user menu would go here */}
        <HeaderActions translations={translations} />
      </div>
    </header>
  );
}

function BreadcrumbTrail() {
  // This would be implemented with actual breadcrumb logic
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>Dashboard</li>
      </ol>
    </nav>
  );
}

type HeaderActionsProps = {
  translations: AdminLayoutTranslations['header'];
};

function HeaderActions({ translations }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Placeholder for header actions */}
      <div className="text-sm text-muted-foreground">
        {translations.title}
      </div>
    </div>
  );
}

type NavigationMenuProps = {
  locale: string;
  translations: AdminLayoutTranslations['navigation'];
  collapsed: boolean;
};

function NavigationMenu({ }: NavigationMenuProps) {
  return (
    <nav className="flex-1 p-3 overflow-y-auto">
      <div className="space-y-1">
        {/* Navigation items would be rendered here */}
        {/* This will be implemented in the next component */}
        <div className="text-sm text-muted-foreground p-2">
          Navigation items will be rendered here
        </div>
      </div>
    </nav>
  );
}

type ContentAreaProps = {
  children: React.ReactNode;
};

function ContentArea({ children }: ContentAreaProps) {
  return (
    <div className="p-4 lg:p-6 max-w-full">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}
