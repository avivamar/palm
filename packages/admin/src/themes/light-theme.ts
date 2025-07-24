/**
 * Light Theme Configuration
 * 浅色主题配置
 */

import type { ThemeConfig } from './ThemeProvider';

export const lightTheme: ThemeConfig = {
  colors: {
    // Primary brand colors
    primary: '220 90% 56%', // Blue primary
    secondary: '220 14.3% 95.9%', // Light gray

    // Background colors
    background: '0 0% 100%', // Pure white
    foreground: '220 8.9% 4.9%', // Almost black

    // Card colors
    card: '0 0% 100%', // White cards
    cardForeground: '220 8.9% 4.9%', // Dark text on cards

    // Popover colors
    popover: '0 0% 100%', // White popover
    popoverForeground: '220 8.9% 4.9%', // Dark text in popover

    // Muted colors
    muted: '220 14.3% 95.9%', // Light gray background
    mutedForeground: '220 8.9% 45.1%', // Medium gray text

    // Accent colors
    accent: '220 14.3% 95.9%', // Light accent
    accentForeground: '220 8.9% 4.9%', // Dark accent text

    // Status colors
    destructive: '0 84.2% 60.2%', // Red for errors/delete
    destructiveForeground: '210 20% 98%', // Light text on red

    // Border and input colors
    border: '220 13% 91%', // Light borders
    input: '220 13% 91%', // Input borders
    ring: '220 90% 56%', // Focus ring (same as primary)
  },

  borderRadius: '0.5rem',

  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'SF Mono',
      'Monaco',
      'Inconsolata',
      'Roboto Mono',
      'Source Code Pro',
      'Menlo',
      'Consolas',
      'DejaVu Sans Mono',
      'monospace',
    ],
  },

  spacing: {
    'xs': '0.25rem', // 4px
    'sm': '0.5rem', // 8px
    'md': '1rem', // 16px
    'lg': '1.5rem', // 24px
    'xl': '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  breakpoints: {
    'sm': '640px', // Small screens
    'md': '768px', // Medium screens (tablets)
    'lg': '1024px', // Large screens (laptops)
    'xl': '1280px', // Extra large screens
    '2xl': '1536px', // 2X large screens
  },
};

// CSS custom properties for light theme
export const lightThemeCSSVars = `
  --primary: ${lightTheme.colors.primary};
  --secondary: ${lightTheme.colors.secondary};
  --background: ${lightTheme.colors.background};
  --foreground: ${lightTheme.colors.foreground};
  --card: ${lightTheme.colors.card};
  --card-foreground: ${lightTheme.colors.cardForeground};
  --popover: ${lightTheme.colors.popover};
  --popover-foreground: ${lightTheme.colors.popoverForeground};
  --muted: ${lightTheme.colors.muted};
  --muted-foreground: ${lightTheme.colors.mutedForeground};
  --accent: ${lightTheme.colors.accent};
  --accent-foreground: ${lightTheme.colors.accentForeground};
  --destructive: ${lightTheme.colors.destructive};
  --destructive-foreground: ${lightTheme.colors.destructiveForeground};
  --border: ${lightTheme.colors.border};
  --input: ${lightTheme.colors.input};
  --ring: ${lightTheme.colors.ring};
  --radius: ${lightTheme.borderRadius};
`;

// Light theme semantic color mappings
export const lightSemanticColors = {
  // Status colors
  success: '142 76% 36%', // Green
  warning: '38 92% 50%', // Orange/Yellow
  info: '199 89% 48%', // Blue
  error: '0 84.2% 60.2%', // Red (same as destructive)

  // Content colors
  textPrimary: '220 8.9% 4.9%', // Main text
  textSecondary: '220 8.9% 45.1%', // Secondary text
  textTertiary: '220 8.9% 65%', // Tertiary text
  textDisabled: '220 8.9% 75%', // Disabled text

  // Surface colors
  surfacePrimary: '0 0% 100%', // Main surface
  surfaceSecondary: '220 14.3% 95.9%', // Secondary surface
  surfaceTertiary: '220 13% 91%', // Tertiary surface

  // Interactive colors
  interactiveHover: '220 90% 50%', // Hover state
  interactiveActive: '220 90% 45%', // Active state
  interactiveDisabled: '220 8.9% 85%', // Disabled state
};

// Light theme component-specific styles
export const lightComponentStyles = {
  button: {
    primary: {
      background: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      hover: 'hsl(var(--primary) / 0.9)',
    },
    secondary: {
      background: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
      hover: 'hsl(var(--secondary) / 0.8)',
    },
    outline: {
      background: 'transparent',
      color: 'hsl(var(--foreground))',
      border: 'hsl(var(--border))',
      hover: 'hsl(var(--accent))',
    },
    ghost: {
      background: 'transparent',
      color: 'hsl(var(--foreground))',
      hover: 'hsl(var(--accent))',
    },
    destructive: {
      background: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
      hover: 'hsl(var(--destructive) / 0.9)',
    },
  },

  card: {
    background: 'hsl(var(--card))',
    border: 'hsl(var(--border))',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },

  input: {
    background: 'hsl(var(--background))',
    border: 'hsl(var(--input))',
    color: 'hsl(var(--foreground))',
    placeholder: 'hsl(var(--muted-foreground))',
    focus: {
      border: 'hsl(var(--ring))',
      ring: 'hsl(var(--ring) / 0.2)',
    },
  },

  navigation: {
    background: 'hsl(var(--background))',
    border: 'hsl(var(--border))',
    itemHover: 'hsl(var(--accent))',
    itemActive: 'hsl(var(--primary) / 0.1)',
  },
};
