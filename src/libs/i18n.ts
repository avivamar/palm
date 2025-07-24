import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18nRouting';

// NextJS Boilerplate uses Crowdin as the localization software.
// As a developer, you only need to take care of the English (or another default language) version.
// Other languages are automatically generated and handled by Crowdin.

// The localisation files are synced with Crowdin using GitHub Actions.
// By default, there are 3 ways to sync the message files:
// 1. Automatically sync on push to the `main` branch
// 2. Run manually the workflow on GitHub Actions
// 3. Every 24 hours at 5am, the workflow will run automatically

// Using internationalization in Server Components
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      // 加载拆分的多语言文件
      ...(await import(`../locales/${locale}/business.json`)).default,
      dashboard: (await import(`../locales/${locale}/dashboard.json`)).default,
      ...(await import(`../locales/${locale}/commerce.json`)).default,
      ...(await import(`../locales/${locale}/core.json`)).default,
      ...(await import(`../locales/${locale}/legal.json`)).default,
      ...(await import(`../locales/${locale}/pages.json`)).default,
      ...(await import(`../locales/${locale}/user.json`)).default,
      admin: (await import(`../locales/${locale}/admin.json`)).default,
      ...(await import(`../locales/${locale}/unauthorized.json`)).default,
      ...(await import(`../locales/${locale}/validation.json`)).default,
    },
  };
});
