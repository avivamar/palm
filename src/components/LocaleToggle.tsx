'use client';

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/libs/i18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

// 语言名称映射
const localeNames: Record<string, string> = {
  'en': 'English',
  'es': 'Español',
  'ja': '日本語',
  'zh-HK': '繁體中文',
};

export const LocaleToggle = () => {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('LocaleSwitcher');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    try {
      // 使用 next-intl 的路由器进行语言切换
      // 这会自动处理路径转换和语言前缀
      router.push(pathname, { locale: newLocale });
    } catch (error) {
      // Language switch error
      // 降级到手动跳转
      const targetPath = newLocale === 'en' ? pathname : `/${newLocale}${pathname}`;
      window.location.href = targetPath;
    }
  };

  // 在服务端渲染期间，返回一个简化的按钮
  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Language</span>
      </Button>
    );
  }

  // 客户端渲染完整的下拉菜单
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('label')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {AppConfig.locales.map(l => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className={locale === l ? 'bg-muted font-medium' : ''}
          >
            {localeNames[l] || l}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
