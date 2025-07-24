import { Poppins as FontSans } from 'next/font/google';

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap', // 优化字体显示策略
  preload: true, // 预加载关键字体
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true, // 自动调整回退字体
  weight: ['300', '400', '500', '600', '700'], // Poppins 推荐字重
});
