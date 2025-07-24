/**
 * Dark Theme Configuration
 * 深色主题配置
 */

import type { ThemeConfig } from './ThemeProvider';

export const darkTheme: ThemeConfig = {
  colors: {
    // Primary brand colors
    primary: '220 90% 56%', // Blue primary (same as light)
    secondary: '220 8.9% 9.8%', // Dark gray

    // Background colors
    background: '220 8.9% 4.9%', // Very dark gray
    foreground: '210 20% 98%', // Almost white

    // Card colors
    card: '220 8.9% 4.9%', // Dark cards
    cardForeground: '210 20% 98%', // Light text on cards

    // Popover colors
    popover: '220 8.9% 4.9%', // Dark popover
    popoverForeground: '210 20% 98%', // Light text in popover

    // Muted colors
    muted: '220 8.9% 9.8%', // Dark gray background
    mutedForeground: '220 8.9% 63.9%', // Medium light gray text

    // Accent colors
    accent: '220 8.9% 9.8%', // Dark accent
    accentForeground: '210 20% 98%', // Light accent text

    // Status colors
    destructive: '0 84.2% 60.2%', // Red for errors/delete (same as light)
    destructiveForeground: '210 20% 98%', // Light text on red

    // Border and input colors
    border: '220 8.9% 9.8%', // Dark borders
    input: '220 8.9% 9.8%', // Input borders
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

// CSS custom properties for dark theme
export const darkThemeCSSVars = `
  --primary: ${darkTheme.colors.primary};
  --secondary: ${darkTheme.colors.secondary};
  --background: ${darkTheme.colors.background};
  --foreground: ${darkTheme.colors.foreground};
  --card: ${darkTheme.colors.card};
  --card-foreground: ${darkTheme.colors.cardForeground};
  --popover: ${darkTheme.colors.popover};
  --popover-foreground: ${darkTheme.colors.popoverForeground};
  --muted: ${darkTheme.colors.muted};
  --muted-foreground: ${darkTheme.colors.mutedForeground};
  --accent: ${darkTheme.colors.accent};
  --accent-foreground: ${darkTheme.colors.accentForeground};
  --destructive: ${darkTheme.colors.destructive};
  --destructive-foreground: ${darkTheme.colors.destructiveForeground};
  --border: ${darkTheme.colors.border};
  --input: ${darkTheme.colors.input};
  --ring: ${darkTheme.colors.ring};
  --radius: ${darkTheme.borderRadius};
`;

// Dark theme semantic color mappings
export const darkSemanticColors = {
  // Status colors
  success: '142 71% 45%', // Green (slightly brighter for dark mode)
  warning: '38 92% 60%', // Orange/Yellow (brighter)
  info: '199 89% 58%', // Blue (brighter)
  error: '0 84.2% 60.2%', // Red (same as destructive)

  // Content colors
  textPrimary: '210 20% 98%', // Main text (light)
  textSecondary: '220 8.9% 63.9%', // Secondary text
  textTertiary: '220 8.9% 45%', // Tertiary text
  textDisabled: '220 8.9% 25%', // Disabled text

  // Surface colors
  surfacePrimary: '220 8.9% 4.9%', // Main surface (dark)
  surfaceSecondary: '220 8.9% 9.8%', // Secondary surface
  surfaceTertiary: '220 8.9% 15%', // Tertiary surface

  // Interactive colors
  interactiveHover: '220 90% 60%', // Hover state (brighter)
  interactiveActive: '220 90% 65%', // Active state (brighter)
  interactiveDisabled: '220 8.9% 15%', // Disabled state
};

// Dark theme component-specific styles
export const darkComponentStyles = {
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
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
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

  // Dark mode specific enhancements
  scrollbar: {
    track: 'hsl(220 8.9% 9.8%)',
    thumb: 'hsl(220 8.9% 20%)',
    thumbHover: 'hsl(220 8.9% 25%)',
  },

  selection: {
    background: 'hsl(var(--primary) / 0.3)',
    color: 'hsl(var(--foreground))',
  },

  codeBlock: {
    background: 'hsl(220 8.9% 2%)',
    border: 'hsl(220 8.9% 15%)',
    text: 'hsl(210 20% 85%)',
  },
};
