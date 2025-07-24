/**
 * Themes Index
 * 主题系统统一导出
 */

export { darkComponentStyles, darkSemanticColors, darkTheme, darkThemeCSSVars } from './dark-theme';

// Theme configurations
export { lightComponentStyles, lightSemanticColors, lightTheme, lightThemeCSSVars } from './light-theme';
// Theme components
export {
  ThemeDropdown,
  type ThemeDropdownProps,
  ThemeSelector,
  type ThemeSelectorProps,
  ThemeSettings,
  type ThemeSettingsProps,
  ThemeToggle,
  type ThemeToggleProps,
} from './theme-toggle';

// Core theme system
export {
  type Theme,
  type ThemeConfig,
  type ThemeContextType,
  ThemeProvider,
  type ThemeProviderProps,
  useTheme,
} from './ThemeProvider';
