/**
 * Internationalization (i18n) Index
 * 国际化系统统一导出
 */

// Core i18n system
export {
  type I18nContextType,
  I18nProvider,
  type I18nProviderProps,
  type LocaleConfig,
  type SupportedLocale,
  supportedLocales,
  type TranslationNamespace,
  useI18n,
} from './AdminTranslations';

// Language switcher components
export {
  LanguageSwitcher,
  type LanguageSwitcherProps,
  TranslationStatus,
  type TranslationStatusProps,
} from './AdminTranslations';

// Additional language switcher variants
export {
  AdvancedLanguageSelector,
  type AdvancedLanguageSelectorProps,
  CompactLanguageSwitcher,
  type CompactLanguageSwitcherProps,
  LanguageMenu,
  type LanguageMenuProps,
  LanguageToggle,
  type LanguageToggleProps,
  QuickLanguagePicker,
  type QuickLanguagePickerProps,
} from './language-switcher';

// RTL support utilities
export {
  generateRTLCSSVars,
  logicalPropertiesPolyfill,
  rtlStyles,
  rtlTailwindClasses,
  rtlUtils,
  RTLWrapper,
  type RTLWrapperProps,
  useRTL,
} from './rtl-support';
