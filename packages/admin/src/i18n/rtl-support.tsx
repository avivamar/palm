/**
 * RTL Support Utilities
 * RTL 语言支持工具 - 处理从右到左的语言布局
 */

import type { SupportedLocale } from './AdminTranslations';
import React from 'react';

// RTL languages configuration
export const rtlLocales: SupportedLocale[] = [];

// Utility functions for RTL support
export const rtlUtils = {
  /**
   * Check if a locale is RTL
   */
  isRTL: (locale: SupportedLocale): boolean => {
    return rtlLocales.includes(locale);
  },

  /**
   * Get text direction for a locale
   */
  getDirection: (locale: SupportedLocale): 'ltr' | 'rtl' => {
    return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  },

  /**
   * Get appropriate margin/padding classes for RTL
   */
  getSpacingClass: (
    locale: SupportedLocale,
    property: 'ml' | 'mr' | 'pl' | 'pr',
    value: string,
  ): string => {
    const isRTL = rtlUtils.isRTL(locale);

    // Flip left/right properties for RTL
    if (isRTL) {
      switch (property) {
        case 'ml':
          return `mr-${value}`;
        case 'mr':
          return `ml-${value}`;
        case 'pl':
          return `pr-${value}`;
        case 'pr':
          return `pl-${value}`;
        default:
          return `${property}-${value}`;
      }
    }

    return `${property}-${value}`;
  },

  /**
   * Get flex direction class for RTL
   */
  getFlexDirection: (
    locale: SupportedLocale,
    direction: 'row' | 'row-reverse',
  ): string => {
    const isRTL = rtlUtils.isRTL(locale);

    if (isRTL && direction === 'row') {
      return 'flex-row-reverse';
    }
    if (!isRTL && direction === 'row-reverse') {
      return 'flex-row';
    }

    return `flex-${direction}`;
  },

  /**
   * Get text alignment class for RTL
   */
  getTextAlign: (
    locale: SupportedLocale,
    align: 'left' | 'right' | 'center',
  ): string => {
    const isRTL = rtlUtils.isRTL(locale);

    if (isRTL) {
      switch (align) {
        case 'left':
          return 'text-right';
        case 'right':
          return 'text-left';
        default:
          return `text-${align}`;
      }
    }

    return `text-${align}`;
  },

  /**
   * Get border radius classes for RTL
   */
  getBorderRadius: (
    locale: SupportedLocale,
    position: 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br',
    value: string,
  ): string => {
    const isRTL = rtlUtils.isRTL(locale);

    if (isRTL) {
      switch (position) {
        case 'l':
          return `rounded-r-${value}`;
        case 'r':
          return `rounded-l-${value}`;
        case 'tl':
          return `rounded-tr-${value}`;
        case 'tr':
          return `rounded-tl-${value}`;
        case 'bl':
          return `rounded-br-${value}`;
        case 'br':
          return `rounded-bl-${value}`;
        default:
          return `rounded-${position}-${value}`;
      }
    }

    return `rounded-${position}-${value}`;
  },
};

// CSS-in-JS RTL utilities
export const rtlStyles = {
  /**
   * Generate CSS properties for RTL support
   */
  marginLeft: (locale: SupportedLocale, value: string) => {
    const property = rtlUtils.isRTL(locale) ? 'marginRight' : 'marginLeft';
    return { [property]: value };
  },

  marginRight: (locale: SupportedLocale, value: string) => {
    const property = rtlUtils.isRTL(locale) ? 'marginLeft' : 'marginRight';
    return { [property]: value };
  },

  paddingLeft: (locale: SupportedLocale, value: string) => {
    const property = rtlUtils.isRTL(locale) ? 'paddingRight' : 'paddingLeft';
    return { [property]: value };
  },

  paddingRight: (locale: SupportedLocale, value: string) => {
    const property = rtlUtils.isRTL(locale) ? 'paddingLeft' : 'paddingRight';
    return { [property]: value };
  },

  textAlign: (locale: SupportedLocale, align: 'left' | 'right' | 'center') => {
    if (align === 'center') {
      return { textAlign: 'center' };
    }

    const isRTL = rtlUtils.isRTL(locale);
    const alignValue = isRTL ? (align === 'left' ? 'right' : 'left') : align;
    return { textAlign: alignValue as 'left' | 'right' };
  },

  transform: (locale: SupportedLocale, value: string) => {
    const isRTL = rtlUtils.isRTL(locale);

    // Flip X translations for RTL
    if (isRTL && value.includes('translateX')) {
      return {
        transform: value.replace(/translateX\(([^)]+)\)/, (_, p1) => {
          // Flip the sign of translateX values
          const flipped = p1.startsWith('-') ? p1.slice(1) : `-${p1}`;
          return `translateX(${flipped})`;
        }),
      };
    }

    return { transform: value };
  },
};

// React hook for RTL support
export function useRTL(locale: SupportedLocale) {
  const isRTL = rtlUtils.isRTL(locale);
  const direction = rtlUtils.getDirection(locale);

  return {
    isRTL,
    direction,

    // Helper functions
    spacing: (property: 'ml' | 'mr' | 'pl' | 'pr', value: string) =>
      rtlUtils.getSpacingClass(locale, property, value),

    flexDirection: (direction: 'row' | 'row-reverse') =>
      rtlUtils.getFlexDirection(locale, direction),

    textAlign: (align: 'left' | 'right' | 'center') =>
      rtlUtils.getTextAlign(locale, align),

    borderRadius: (position: 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br', value: string) =>
      rtlUtils.getBorderRadius(locale, position, value),
  };
}

// Component wrapper for RTL layout
export type RTLWrapperProps = {
  locale: SupportedLocale;
  children: React.ReactNode;
  className?: string;
};

export function RTLWrapper({ locale, children, className }: RTLWrapperProps) {
  const direction = rtlUtils.getDirection(locale);

  return (
    <div dir={direction} className={className}>
      {children}
    </div>
  );
}

// CSS custom properties for RTL
export const generateRTLCSSVars = (locale: SupportedLocale) => {
  const isRTL = rtlUtils.isRTL(locale);

  return {
    '--text-align-start': isRTL ? 'right' : 'left',
    '--text-align-end': isRTL ? 'left' : 'right',
    '--border-radius-start': isRTL ? 'border-top-right-radius border-bottom-right-radius' : 'border-top-left-radius border-bottom-left-radius',
    '--border-radius-end': isRTL ? 'border-top-left-radius border-bottom-left-radius' : 'border-top-right-radius border-bottom-right-radius',
    '--margin-start': isRTL ? 'margin-right' : 'margin-left',
    '--margin-end': isRTL ? 'margin-left' : 'margin-right',
    '--padding-start': isRTL ? 'padding-right' : 'padding-left',
    '--padding-end': isRTL ? 'padding-left' : 'padding-right',
  };
};

// Tailwind CSS utility classes for RTL
export const rtlTailwindClasses = {
  // Spacing utilities
  'ms-auto': 'margin-inline-start: auto',
  'me-auto': 'margin-inline-end: auto',
  'ps-4': 'padding-inline-start: 1rem',
  'pe-4': 'padding-inline-end: 1rem',

  // Text alignment
  'text-start': 'text-align: start',
  'text-end': 'text-align: end',

  // Flex utilities
  'justify-start': 'justify-content: flex-start',
  'justify-end': 'justify-content: flex-end',

  // Border radius
  'rounded-s': 'border-start-start-radius: 0.25rem; border-end-start-radius: 0.25rem',
  'rounded-e': 'border-start-end-radius: 0.25rem; border-end-end-radius: 0.25rem',
};

// Logical properties polyfill for older browsers
export const logicalPropertiesPolyfill = `
  /* Logical properties polyfill for RTL support */
  .ms-auto { margin-inline-start: auto; }
  .me-auto { margin-inline-end: auto; }
  .ps-1 { padding-inline-start: 0.25rem; }
  .ps-2 { padding-inline-start: 0.5rem; }
  .ps-3 { padding-inline-start: 0.75rem; }
  .ps-4 { padding-inline-start: 1rem; }
  .pe-1 { padding-inline-end: 0.25rem; }
  .pe-2 { padding-inline-end: 0.5rem; }
  .pe-3 { padding-inline-end: 0.75rem; }
  .pe-4 { padding-inline-end: 1rem; }
  
  .text-start { text-align: start; }
  .text-end { text-align: end; }
  
  .rounded-s { border-start-start-radius: 0.25rem; border-end-start-radius: 0.25rem; }
  .rounded-e { border-start-end-radius: 0.25rem; border-end-end-radius: 0.25rem; }
  .rounded-s-lg { border-start-start-radius: 0.5rem; border-end-start-radius: 0.5rem; }
  .rounded-e-lg { border-start-end-radius: 0.5rem; border-end-end-radius: 0.5rem; }
`;
