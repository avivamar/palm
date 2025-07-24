/**
 * Language Switcher Component
 * 语言切换器 - 支持下拉菜单、选择器和切换按钮模式
 */

'use client';

import {
  Check,
  ChevronDown,
  Globe,
  Languages,
  Loader2,
} from 'lucide-react';
import React, { useState } from 'react';
import { supportedLocales, useI18n } from './AdminTranslations';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Compact Language Switcher
export type CompactLanguageSwitcherProps = {
  showFlag?: boolean;
  className?: string;
};

export function CompactLanguageSwitcher({
  showFlag = true,
  className,
}: CompactLanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = supportedLocales.find(l => l.code === locale);

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="h-8 w-8 p-0"
        aria-label="Change language"
      >
        {isLoading
          ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            )
          : showFlag
            ? (
                <span className="text-sm">{currentLocale?.flag}</span>
              )
            : (
                <Globe className="h-4 w-4" />
              )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[140px]">
            <div className="py-1">
              {supportedLocales.map(localeConfig => (
                <button
                  key={localeConfig.code}
                  onClick={() => {
                    setLocale(localeConfig.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-sm text-left',
                    'hover:bg-accent hover:text-accent-foreground',
                    locale === localeConfig.code ? 'bg-accent/50' : '',
                  )}
                >
                  <span>{localeConfig.flag}</span>
                  <span>{localeConfig.code.toUpperCase()}</span>
                  {locale === localeConfig.code && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Language Toggle Button
export type LanguageToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function LanguageToggle({
  className,
  showLabel = false,
}: LanguageToggleProps) {
  const { locale, setLocale, isLoading } = useI18n();

  const currentIndex = supportedLocales.findIndex(l => l.code === locale);
  const nextLocale = supportedLocales[(currentIndex + 1) % supportedLocales.length];
  const currentLocale = supportedLocales[currentIndex];

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => nextLocale && setLocale(nextLocale.code)}
      disabled={isLoading}
      className={cn('gap-2', className)}
      aria-label={nextLocale ? `Switch to ${nextLocale.name}` : 'Switch language'}
    >
      {isLoading
        ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          )
        : (
            <>
              <span>{currentLocale?.flag}</span>
              {showLabel && currentLocale && (
                <span className="text-xs">
                  {currentLocale.code.toUpperCase()}
                </span>
              )}
            </>
          )}
    </Button>
  );
}

// Advanced Language Selector
export type AdvancedLanguageSelectorProps = {
  className?: string;
  showNativeNames?: boolean;
  layout?: 'grid' | 'list';
};

export function AdvancedLanguageSelector({
  className,
  showNativeNames = true,
  layout = 'grid',
}: AdvancedLanguageSelectorProps) {
  const { locale, setLocale, isLoading, t } = useI18n();

  const layoutClasses = layout === 'grid'
    ? 'grid grid-cols-2 gap-3'
    : 'space-y-2';

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          {t('language', 'common')}
        </h3>
      </div>

      <div className={layoutClasses}>
        {supportedLocales.map((localeConfig) => {
          const isSelected = locale === localeConfig.code;
          const isRTL = localeConfig.rtl;

          return (
            <button
              key={localeConfig.code}
              onClick={() => setLocale(localeConfig.code)}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                'hover:bg-accent/50 hover:border-accent-foreground/20',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card',
                isRTL ? 'flex-row-reverse' : '',
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <span className="text-lg flex-shrink-0">
                {localeConfig.flag}
              </span>

              <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
                <div className="text-sm font-medium text-foreground truncate">
                  {localeConfig.name}
                </div>
                {showNativeNames && localeConfig.nativeName !== localeConfig.name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {localeConfig.nativeName}
                  </div>
                )}
              </div>

              {isSelected && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('loadingTranslations', 'common')}
          </span>
        </div>
      )}
    </div>
  );
}

// Language Menu for Navigation
export type LanguageMenuProps = {
  trigger?: React.ReactNode;
  className?: string;
};

export function LanguageMenu({ trigger, className }: LanguageMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, isLoading } = useI18n();

  const currentLocale = supportedLocales.find(l => l.code === locale);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2"
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {currentLocale?.code.toUpperCase()}
      </span>
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[200px]">
            <div className="py-1" role="menu">
              <div className="px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Language
                  </span>
                </div>
              </div>

              {supportedLocales.map(localeConfig => (
                <button
                  key={localeConfig.code}
                  onClick={() => {
                    setLocale(localeConfig.code);
                    setIsOpen(false);
                  }}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm text-left',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    locale === localeConfig.code ? 'bg-accent/50' : '',
                  )}
                  role="menuitem"
                  dir={localeConfig.rtl ? 'rtl' : 'ltr'}
                >
                  <span className="text-base">{localeConfig.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {localeConfig.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {localeConfig.nativeName}
                    </div>
                  </div>
                  {locale === localeConfig.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Quick Language Picker for Settings
export type QuickLanguagePickerProps = {
  className?: string;
};

export function QuickLanguagePicker({ className }: QuickLanguagePickerProps) {
  const { locale, setLocale, isLoading, t } = useI18n();

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {t('language', 'common')}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {supportedLocales.map(localeConfig => (
          <button
            key={localeConfig.code}
            onClick={() => setLocale(localeConfig.code)}
            disabled={isLoading}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              locale === localeConfig.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            title={localeConfig.name}
            aria-label={`Switch to ${localeConfig.name}`}
          >
            <span className="text-sm">{localeConfig.flag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
