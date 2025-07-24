import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],

  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      /** 色彩系统 */
      colors: {
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'brand': {
          50: '#fefffe',
          100: '#fdfffc',
          200: '#fbfff7',
          300: '#f8fff2',
          400: '#f4ffed',
          500: '#ebff7f',
          600: '#d4e672',
          700: '#bdcc65',
          800: '#a6b358',
          900: '#8f994b',
        },
        'brand-main': '#7c88ff',
        'brand-main-light': '#7c88ff',
        'brand-main-dark': '#3a42b8',
        'brand-accent': '#ebff7f',
      },

      /** 背景图像 */
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c88ff, #c894ff)',
      },

      /** 圆角 */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '0.75rem',
      },

      /** 阴影 & Ring */
      boxShadow: {
        'brand': '0 4px 12px rgba(124, 136, 255, 0.3)',
        'brand-ring': '0 0 0 2px rgba(235,255,127,0.5)',
        'brand-md': '0 2px 4px rgba(235,255,127,0.3)',
      },
      ringColor: {
        brand: 'rgba(235,255,127,0.5)',
      },

      /** 动画 */
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      animationDelay: {
        2000: '2s',
        4000: '4s',
      },
    },
  },

  plugins: [
    tailwindcssAnimate,
    require('@tailwindcss/forms'),
    /**
     * 自定义组件 & 工具类
     */
    function ({ addComponents, addUtilities, theme }: { addComponents: any; addUtilities: any; theme: any }) {
      // 按钮组件 (支持 dark / hover / active / disabled)
      addComponents({
        '.btn-brand': {
          'backgroundColor': theme('colors.brand.500'),
          'color': '#1a1a1a',
          'fontWeight': '600',
          'borderRadius': theme('borderRadius.md'),
          'padding': '0.625rem 1.25rem',
          'transition': 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.brand.400'),
            boxShadow: theme('boxShadow.brand'),
          },
          '&:active': {
            backgroundColor: theme('colors.brand.600'),
          },
          '&:disabled': {
            backgroundColor: theme('colors.brand.200'),
            color: '#aaa',
            cursor: 'not-allowed',
            opacity: '0.6',
          },
          // 深色模式自动反转文字颜色，保持可读
          '.dark &': {
            color: '#1a1a1a',
          },
        },
      });

      // 实用工具类 (支持 responsive / hover / focus / dark)
      addUtilities(
        {
          '.text-brand': { color: 'var(--brand-accent)' },
          '.bg-brand': { backgroundColor: 'var(--brand-accent)' },
          '.bg-brand-soft': { backgroundColor: 'var(--brand-surface)' },
          '.border-brand': { borderColor: 'var(--brand-accent)' },
          '.ring-brand': { '--tw-ring-color': 'var(--brand-accent)' },
          '.shadow-brand': { boxShadow: '0 0 0 2px var(--brand-accent)' },
          '.animation-delay-2000': { 'animation-delay': '2s' },
          '.animation-delay-4000': { 'animation-delay': '4s' },
        },
        { variants: ['responsive', 'hover', 'focus', 'dark'] },
      );
    },
  ],
};

export default config;
