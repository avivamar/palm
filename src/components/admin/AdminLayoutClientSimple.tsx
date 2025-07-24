/**
 * Simplified Admin Layout Client Component
 * 临时简化版本，用于解决构建问题
 */

'use client';

import React from 'react';

type AdminLayoutClientProps = {
  locale: string;
  children: React.ReactNode;
};

export function AdminLayoutClient({
  locale,
  children,
}: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simplified header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <div className="text-sm text-muted-foreground">
            {locale}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
