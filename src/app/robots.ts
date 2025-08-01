import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/utils/Helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/debug-payment/',
          '/test-payment/',
          '/pre-order/success',
          '/sign-in/',
          '/sign-up/',
          '/user-profile/',
          '/portfolio/',
          '/test/',
          '/blog/',
        ],
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
