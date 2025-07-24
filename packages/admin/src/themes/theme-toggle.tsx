/**
 * Theme Toggle Component
 * 主题切换组件 - 简单切换和高级选择器
 */

'use client';

import type { Theme } from './ThemeProvider';
import {
  Check,
  ChevronDown,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Simple Theme Toggle Button
export type ThemeToggleProps = {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  className?: string;
  iconOnly?: boolean;
};

export function ThemeToggle({
  variant = 'outline',
  size = 'default',
  showLabel = false,
  className,
  iconOnly = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const currentIndex = themes.findIndex(t => t.value === theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  const currentTheme = themes[currentIndex];

  const sizeClasses = {
    sm: 'h-8 w-8 px-0',
    default: 'h-10 w-10 px-0',
    lg: 'h-12 w-12 px-0',
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        onClick={() => nextTheme && setTheme(nextTheme.value)}
        className={cn(
          sizeClasses[size],
          'relative overflow-hidden',
          className,
        )}
        aria-label={nextTheme ? `Switch to ${nextTheme.label} theme` : 'Switch theme'}
        title={currentTheme ? `Current: ${currentTheme.label} theme` : 'Current theme'}
      >
        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300">
          {resolvedTheme === 'dark'
            ? (
                <Moon className="h-4 w-4" />
              )
            : (
                <Sun className="h-4 w-4" />
              )}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => nextTheme && setTheme(nextTheme.value)}
      className={cn('gap-2', className)}
      aria-label={nextTheme ? `Switch to ${nextTheme.label} theme` : 'Switch theme'}
    >
      {currentTheme?.icon}
      {showLabel && currentTheme && (
        <span className="text-sm">
          {currentTheme.label}
        </span>
      )}
    </Button>
  );
}

// Advanced Theme Selector
export type ThemeSelectorProps = {
  className?: string;
  showPreview?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

export function ThemeSelector({
  className,
  showPreview = false,
  orientation = 'horizontal',
}: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: Array<{
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
    preview?: string;
  }> = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      description: 'Clean and bright interface',
      preview: 'bg-white border-gray-200',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      description: 'Easy on the eyes',
      preview: 'bg-gray-900 border-gray-700',
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Follows your system preference',
      preview: resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
    },
  ];

  const layoutClasses = orientation === 'horizontal'
    ? 'grid grid-cols-3 gap-3'
    : 'space-y-3';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Theme
        </h3>
      </div>

      <div className={layoutClasses}>
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption.value;

          return (
            <button
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                'flex flex-col items-start gap-2 p-3 rounded-lg border-2 transition-all duration-200',
                'hover:bg-accent/50 hover:border-accent-foreground/20',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card',
                orientation === 'horizontal' ? 'items-center text-center' : '',
              )}
              aria-label={`Select ${themeOption.label} theme`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex-shrink-0">
                  {themeOption.icon}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {themeOption.label}
                </span>
                {isSelected && (
                  <Check className="h-3 w-3 text-primary ml-auto" />
                )}
              </div>

              {orientation === 'vertical' && (
                <p className="text-xs text-muted-foreground text-left">
                  {themeOption.description}
                </p>
              )}

              {showPreview && themeOption.preview && (
                <div className={cn(
                  'w-full h-6 rounded border-2 mt-1',
                  themeOption.preview,
                )}
                />
              )}
            </button>
          );
        })}
      </div>

      {theme === 'system' && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <Monitor className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Currently using
            {' '}
            {resolvedTheme}
            {' '}
            mode
          </span>
        </div>
      )}
    </div>
  );
}

// Theme Dropdown Menu
export type ThemeDropdownProps = {
  trigger?: React.ReactNode;
  className?: string;
};

export function ThemeDropdown({ trigger, className }: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    { value: 'light' as Theme, label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark' as Theme, label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system' as Theme, label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const currentTheme = themes.find(t => t.value === theme);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {currentTheme?.icon}
      <span>{currentTheme?.label}</span>
      <ChevronDown className="h-3 w-3" />
    </Button>
  );

  return (
    <div className={cn('relative', className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {trigger || defaultTrigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[140px]">
            <div className="py-1" role="menu">
              {themes.map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm text-left',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    theme === themeOption.value ? 'bg-accent/50' : '',
                  )}
                  role="menuitem"
                >
                  {themeOption.icon}
                  <span>{themeOption.label}</span>
                  {theme === themeOption.value && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </button>
              ))}

              <div className="border-t border-border my-1" />

              <div className="px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Monitor className="h-3 w-3" />
                  <span>
                    System:
                    {' '}
                    {resolvedTheme}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Theme Settings Panel
export type ThemeSettingsProps = {
  showAdvanced?: boolean;
  className?: string;
};

export function ThemeSettings({ showAdvanced = false, className }: ThemeSettingsProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(showAdvanced);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-base font-medium text-foreground">
            Appearance Settings
          </h3>
        </div>

        {!showAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            Advanced
          </Button>
        )}
      </div>

      <ThemeSelector showPreview orientation="vertical" />

      {showAdvancedSettings && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground">
            Advanced Options
          </h4>

          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Reduce animations
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                High contrast
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Compact layout
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
