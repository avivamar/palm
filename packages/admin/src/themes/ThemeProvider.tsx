/**
 * Theme System Components
 * 主题系统 - 主题提供者、主题切换和样式配置
 */

'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type Theme = 'light' | 'dark' | 'system';

export type ThemeConfig = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  borderRadius: string;
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
};

export type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  config: ThemeConfig;
  updateConfig: (config: Partial<ThemeConfig>) => void;
};

// Theme configurations
const lightTheme: ThemeConfig = {
  colors: {
    primary: '220 90% 56%',
    secondary: '220 14.3% 95.9%',
    background: '0 0% 100%',
    foreground: '220 8.9% 4.9%',
    card: '0 0% 100%',
    cardForeground: '220 8.9% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '220 8.9% 4.9%',
    muted: '220 14.3% 95.9%',
    mutedForeground: '220 8.9% 45.1%',
    accent: '220 14.3% 95.9%',
    accentForeground: '220 8.9% 4.9%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 20% 98%',
    border: '220 13% 91%',
    input: '220 13% 91%',
    ring: '220 90% 56%',
  },
  borderRadius: '0.5rem',
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  spacing: {
    'xs': '0.25rem',
    'sm': '0.5rem',
    'md': '1rem',
    'lg': '1.5rem',
    'xl': '2rem',
    '2xl': '3rem',
  },
  breakpoints: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  },
};

const darkTheme: ThemeConfig = {
  ...lightTheme,
  colors: {
    primary: '220 90% 56%',
    secondary: '220 8.9% 9.8%',
    background: '220 8.9% 4.9%',
    foreground: '210 20% 98%',
    card: '220 8.9% 4.9%',
    cardForeground: '210 20% 98%',
    popover: '220 8.9% 4.9%',
    popoverForeground: '210 20% 98%',
    muted: '220 8.9% 9.8%',
    mutedForeground: '220 8.9% 63.9%',
    accent: '220 8.9% 9.8%',
    accentForeground: '210 20% 98%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 20% 98%',
    border: '220 8.9% 9.8%',
    input: '220 8.9% 9.8%',
    ring: '220 90% 56%',
  },
};

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider
export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  attribute?: 'class' | 'data-theme';
  value?: Record<string, string>;
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'admin-theme',
  enableSystem = true,
  attribute = 'class',
  value: _themeValueMap = { light: 'light', dark: 'dark' },
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [config, setConfig] = useState<ThemeConfig>(lightTheme);

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve actual theme
  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? getSystemTheme() : theme;

  // Update CSS variables and DOM
  const updateTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const themeConfig = newTheme === 'dark' ? darkTheme : lightTheme;

    // Update CSS custom properties
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Update config state
    setConfig(themeConfig);

    // Update DOM attribute
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    } else {
      root.setAttribute('data-theme', newTheme);
    }
  };

  // Set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  // Update theme config
  const updateConfig = (newConfig: Partial<ThemeConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    // Update CSS variables for color changes
    if (newConfig.colors) {
      const root = document.documentElement;
      Object.entries(newConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch (e) {
      console.warn('Failed to load theme preference:', e);
    }
  }, [storageKey]);

  // Update theme when resolved theme changes
  useEffect(() => {
    updateTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateTheme(getSystemTheme());

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    config,
    updateConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme Toggle Component
export type ThemeToggleProps = {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({
  variant = 'outline',
  size = 'default',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  const currentIndex = themes.findIndex(t => t.value === theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => nextTheme && setTheme(nextTheme.value)}
      className={cn('relative', className)}
      aria-label={nextTheme ? `Switch to ${nextTheme.label} theme` : 'Switch theme'}
    >
      {themes[currentIndex]?.icon}
      {showLabel && themes[currentIndex] && (
        <span className="ml-2">
          {themes[currentIndex].label}
        </span>
      )}
    </Button>
  );
}

// Theme Selector Component
export type ThemeSelectorProps = {
  className?: string;
};

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      description: 'Light mode',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      description: 'Dark mode',
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Use system preference',
    },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-foreground">Theme</h3>
      <div className="grid grid-cols-3 gap-2">
        {themes.map(themeOption => (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              theme === themeOption.value
                ? 'border-primary bg-primary/10'
                : 'border-border',
            )}
            aria-label={`Select ${themeOption.label} theme`}
          >
            {themeOption.icon}
            <span className="text-xs font-medium">
              {themeOption.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Custom Theme Builder (Advanced)
export type CustomThemeBuilderProps = {
  onSave?: (config: ThemeConfig) => void;
  className?: string;
};

export function CustomThemeBuilder({ onSave, className }: CustomThemeBuilderProps) {
  const { config, updateConfig } = useTheme();
  const [localConfig, setLocalConfig] = useState(config);

  const handleColorChange = (colorKey: string, value: string) => {
    const newColors = { ...localConfig.colors, [colorKey]: value };
    const newConfig = { ...localConfig, colors: newColors };
    setLocalConfig(newConfig);
    updateConfig({ colors: newColors });
  };

  const handleSave = () => {
    onSave?.(localConfig);
  };

  const handleReset = () => {
    setLocalConfig(config);
    updateConfig(config);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">
          Custom Theme Builder
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(localConfig.colors).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-foreground capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={`hsl(${value})`}
                onChange={(e) => {
                  // Convert hex to HSL (simplified)
                  const hex = e.target.value;
                  handleColorChange(key, hex);
                }}
                className="w-10 h-10 rounded border border-input"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="flex-1 h-10 px-3 rounded border border-input bg-background text-sm"
                placeholder="HSL values (e.g., 220 90% 56%)"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-foreground">
          Preview
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-4 bg-card border border-border rounded-lg">
              <h5 className="font-medium text-card-foreground">Card Example</h5>
              <p className="text-sm text-muted-foreground">
                This is how a card looks with your theme.
              </p>
              <Button size="sm" className="mt-2">
                Primary Button
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium text-foreground">Muted Section</h5>
              <p className="text-sm text-muted-foreground">
                Secondary content area.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Secondary Button
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
