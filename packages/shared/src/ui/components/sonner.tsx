'use client';

import type { ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--popover)',
          '--success-text': 'hsl(142.1 76.2% 36.3%)',
          '--success-border': 'hsl(142.1 76.2% 36.3%)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--destructive)',
          '--error-border': 'var(--destructive)',
          '--warning-bg': 'var(--popover)',
          '--warning-text': 'hsl(32.5 94.6% 43.7%)',
          '--warning-border': 'hsl(32.5 94.6% 43.7%)',
          '--info-bg': 'var(--popover)',
          '--info-text': 'hsl(221.2 83.2% 53.3%)',
          '--info-border': 'hsl(221.2 83.2% 53.3%)',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          background: 'var(--popover)',
          border: '1px solid var(--border)',
          color: 'var(--popover-foreground)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
        },
        className: 'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      }}
      {...props}
    />
  );
};

export { Toaster };
