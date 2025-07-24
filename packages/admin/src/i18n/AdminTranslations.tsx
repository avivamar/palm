/**
 * Admin Translations Component
 * 国际化翻译组件 - 支持多语言切换和翻译管理
 */

'use client';

import {
  Check,
  ChevronDown,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button type="button" className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className} ${variant} ${size}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type SupportedLocale = 'en' | 'es' | 'ja' | 'zh-HK';

export type LocaleConfig = {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
};

export type TranslationNamespace = {
  common: Record<string, string>;
  navigation: Record<string, string>;
  dashboard: Record<string, string>;
  forms: Record<string, string>;
  errors: Record<string, string>;
  [key: string]: Record<string, string>;
};

export type I18nContextType = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  translations: TranslationNamespace;
  isLoading: boolean;
  error: string | null;
  t: (key: string, namespace?: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
};

// Supported locales configuration
export const supportedLocales: LocaleConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
  {
    code: 'zh-HK',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    flag: '🇭🇰',
  },
];

// Default translations (fallback)
const defaultTranslations: TranslationNamespace = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
  },
  navigation: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    products: 'Products',
    customers: 'Customers',
    analytics: 'Analytics',
    settings: 'Settings',
    logout: 'Logout',
  },
  dashboard: {
    overview: 'Overview',
    stats: 'Statistics',
    recentOrders: 'Recent Orders',
    revenue: 'Revenue',
    customers: 'Customers',
    products: 'Products',
  },
  forms: {
    required: 'This field is required',
    invalid: 'Invalid format',
    tooShort: 'Too short',
    tooLong: 'Too long',
    emailInvalid: 'Invalid email address',
    passwordWeak: 'Password is too weak',
  },
  errors: {
    general: 'Something went wrong',
    network: 'Network error',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    tryAgain: 'Please try again',
  },
};

// I18n Context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// I18n Provider
export type I18nProviderProps = {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
};

export function I18nProvider({
  children,
  initialLocale = 'en',
  onLocaleChange,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);
  const [translations, setTranslations] = useState<TranslationNamespace>(defaultTranslations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load translations for a specific locale
  const loadTranslations = async (targetLocale: SupportedLocale) => {
    if (targetLocale === 'en') {
      // English is our default, no need to load
      setTranslations(defaultTranslations);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would load from API or import dynamic modules
      // For now, we'll simulate loading with timeout
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate loaded translations (in real app, these would come from files)
      const loadedTranslations = { ...defaultTranslations };

      // Add locale-specific overrides here
      if (targetLocale === 'es') {
        loadedTranslations.common.save = 'Guardar';
        loadedTranslations.common.cancel = 'Cancelar';
        loadedTranslations.navigation.dashboard = 'Panel de Control';
      } else if (targetLocale === 'ja') {
        loadedTranslations.common.save = '保存';
        loadedTranslations.common.cancel = 'キャンセル';
        loadedTranslations.navigation.dashboard = 'ダッシュボード';
      } else if (targetLocale === 'zh-HK') {
        loadedTranslations.common.save = '儲存';
        loadedTranslations.common.cancel = '取消';
        loadedTranslations.navigation.dashboard = '儀表板';
      }

      setTranslations(loadedTranslations);
    } catch (err) {
      setError('Failed to load translations');
      console.error('Translation loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set locale and load translations
  const setLocale = async (newLocale: SupportedLocale) => {
    if (newLocale === locale) {
      return;
    }

    setLocaleState(newLocale);
    await loadTranslations(newLocale);
    onLocaleChange?.(newLocale);

    // Save to localStorage
    try {
      localStorage.setItem('admin-locale', newLocale);
    } catch (_e) {
      console.warn('Failed to save locale preference:', _e);
    }
  };

  // Translation function
  const t = (key: string, namespace = 'common', params?: Record<string, string | number>): string => {
    const namespaceTranslations = translations[namespace];
    if (!namespaceTranslations) {
      console.warn(`Translation namespace '${namespace}' not found`);
      return key;
    }

    let translation = namespaceTranslations[key];
    if (!translation) {
      console.warn(`Translation key '${key}' not found in namespace '${namespace}'`);
      return key;
    }

    // Replace parameters
    if (params && translation) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation!.replace(`{{${param}}}`, String(value));
      });
    }

    return translation;
  };

  // Number formatting
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(locale, options).format(value);
    } catch (_e) {
      return value.toString();
    }
  };

  // Date formatting
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (_e) {
      return date.toISOString();
    }
  };

  // Currency formatting
  const formatCurrency = (value: number, currency = 'USD'): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(value);
    } catch (_e) {
      return `${currency} ${value}`;
    }
  };

  // Load saved locale on mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('admin-locale') as SupportedLocale;
      if (savedLocale && supportedLocales.some(l => l.code === savedLocale)) {
        setLocale(savedLocale);
      }
    } catch (e) {
      console.warn('Failed to load locale preference:', e);
    }
  }, []);

  const value: I18nContextType = {
    locale,
    setLocale,
    translations,
    isLoading,
    error,
    t,
    formatNumber,
    formatDate,
    formatCurrency,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Language Switcher Component
export type LanguageSwitcherProps = {
  variant?: 'dropdown' | 'selector' | 'toggle';
  size?: 'sm' | 'default' | 'lg';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
};

export function LanguageSwitcher({
  variant = 'dropdown',
  size = 'default',
  showFlag = true,
  showNativeName = false,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = supportedLocales.find(l => l.code === locale);

  if (variant === 'selector') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">
            Language
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {supportedLocales.map(localeConfig => (
            <button
              key={localeConfig.code}
              onClick={() => setLocale(localeConfig.code)}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border-2 transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                locale === localeConfig.code
                  ? 'border-primary bg-primary/10'
                  : 'border-border',
              )}
            >
              {showFlag && (
                <span className="text-lg">{localeConfig.flag}</span>
              )}
              <div className="text-left">
                <div className="text-sm font-medium">
                  {localeConfig.name}
                </div>
                {showNativeName && (
                  <div className="text-xs text-muted-foreground">
                    {localeConfig.nativeName}
                  </div>
                )}
              </div>
              {locale === localeConfig.code && (
                <Check className="h-4 w-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'toggle') {
    const currentIndex = supportedLocales.findIndex(l => l.code === locale);
    const nextLocale = supportedLocales[(currentIndex + 1) % supportedLocales.length];

    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => nextLocale && setLocale(nextLocale.code)}
        disabled={isLoading}
        className={cn('gap-2', className)}
      >
        {isLoading
          ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            )
          : (
              showFlag && <span>{currentLocale?.flag}</span>
            )}
        <span>{currentLocale?.nativeName || currentLocale?.name}</span>
      </Button>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="gap-2"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {isLoading
          ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            )
          : (
              <>
                {showFlag && <span>{currentLocale?.flag}</span>}
                <span>
                  {showNativeName ? currentLocale?.nativeName : currentLocale?.name}
                </span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[180px]">
            <div className="py-1" role="menu">
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
                >
                  {showFlag && (
                    <span className="text-base">{localeConfig.flag}</span>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">
                      {localeConfig.name}
                    </div>
                    {showNativeName && (
                      <div className="text-xs text-muted-foreground">
                        {localeConfig.nativeName}
                      </div>
                    )}
                  </div>
                  {locale === localeConfig.code && (
                    <Check className="h-4 w-4" />
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

// Translation status indicator
export type TranslationStatusProps = {
  className?: string;
};

export function TranslationStatus({ className }: TranslationStatusProps) {
  const { isLoading, error } = useI18n();

  if (!isLoading && !error) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {isLoading && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading translations...</span>
        </>
      )}
      {error && (
        <>
          <RefreshCw className="h-3 w-3 text-destructive" />
          <span className="text-destructive">{error}</span>
        </>
      )}
    </div>
  );
}
