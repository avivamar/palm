import type { MetadataRoute } from 'next';
import { routing } from '@/libs/i18nRouting';
import { getBaseUrl } from '@/utils/Helpers';
import { BlogAdapter } from './[locale]/(marketing)/blog/lib/blog-adapter';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const currentDate = new Date();

  // Define routes shared across all locales
  const routes = [
    '', // Home page
    '/contact',
    '/contact-information',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/shipping',
  ];

  // Generate sitemap entries for each route in each locale
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add root URL (default locale or no locale)
  sitemapEntries.push({
    url: `${baseUrl}/`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Add entries for all locales and routes
  routing.locales.forEach((locale) => {
    routes.forEach((route) => {
      const localePath = locale === routing.defaultLocale
        ? route
        : `/${locale}${route}`;

      sitemapEntries.push({
        url: `${baseUrl}${localePath}`,
        lastModified: currentDate,
        changeFrequency: route === '/blog' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.8,
      });
    });
  });

  // Add blog posts for each locale
  try {
    const posts = await BlogAdapter.getAllPosts();
    routing.locales.forEach((locale) => {
      posts.forEach((post) => {
        if (post.published) {
          const localePath = locale === routing.defaultLocale
            ? `/blog/${post.slug}`
            : `/${locale}/blog/${post.slug}`;

          sitemapEntries.push({
            url: `${baseUrl}${localePath}`,
            lastModified: new Date(post.date),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      });
    });
  } catch (error) {
    console.warn('Failed to load blog posts for sitemap:', error);
  }

  return sitemapEntries;
}
