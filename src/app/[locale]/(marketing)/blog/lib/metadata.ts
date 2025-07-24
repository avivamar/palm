import type { Metadata } from 'next';
import { blogConfig } from '../content/config';

type BlogMetadataProps = {
  title: string;
  description?: string;
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  image?: string;
  category?: string;
  noIndex?: boolean;
};

export function generateBlogMetadata({
  title,
  description,
  image,
  path,
  authors,
  tags,
  publishedTime,
  modifiedTime,
  category,
  locale = 'en',
}: {
  title: string;
  description?: string;
  image?: string;
  path: string;
  authors?: string[];
  tags?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
  locale?: string;
}): Metadata {
  const url = `${blogConfig.url}${path}`;
  const ogImage = image || blogConfig.seo.defaultImage;
  const fullTitle = path === '/blog' ? title : `${title} | ${blogConfig.title}`;
  const metaDescription = description || blogConfig.description;

  return {
    title: fullTitle,
    description: metaDescription,
    authors: authors?.map(name => ({ name })) || [{ name: blogConfig.author.name }],
    creator: blogConfig.author.name,
    publisher: blogConfig.author.name,
    keywords: tags || blogConfig.defaultTags,
    ...(modifiedTime && { lastModified: new Date(modifiedTime) }),
    alternates: {
      canonical: url,
      languages: {
        'en': url.replace(`/${locale}/`, '/'),
        'es': url.replace(`/${locale}/`, '/es/'),
        'ja': url.replace(`/${locale}/`, '/ja/'),
        'zh-HK': url.replace(`/${locale}/`, '/zh-HK/'),
      },
    },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      }],
      siteName: blogConfig.title,
      locale: blogConfig.seo.locale,
      type: 'article',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors: authors.map(name => `${blogConfig.url}/author/${name.toLowerCase().replace(/\s+/g, '-')}`) }),
      ...(category && { section: category }),
      ...(tags && { tags }),
    },
    twitter: {
      card: blogConfig.seo.twitterCard as 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: blogConfig.author.twitter,
      site: blogConfig.author.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        'index': true,
        'follow': true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      ...(category && { 'article:section': category }),
      ...(tags && { 'article:tag': tags.join(', ') }),
      ...(authors && { 'article:author': authors?.join(', ') || blogConfig.author.name }),
    },
  };
}

// Generate JSON-LD structured data for blog posts
export function generateBlogJsonLd({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  authors,
  image,
}: Omit<BlogMetadataProps, 'noIndex'>) {
  const url = `${blogConfig.url}${path}`;
  const ogImage = image || blogConfig.seo.defaultImage;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': description || blogConfig.description,
    url,
    'datePublished': publishedTime,
    'dateModified': modifiedTime || publishedTime,
    'author': authors?.map(name => ({
      '@type': 'Person',
      name,
    })) || [{
      '@type': 'Person',
      'name': blogConfig.author.name,
    }],
    'publisher': {
      '@type': 'Organization',
      'name': blogConfig.title,
      'logo': {
        '@type': 'ImageObject',
        'url': `${blogConfig.url}/logo.svg`,
      },
    },
    'image': {
      '@type': 'ImageObject',
      'url': ogImage,
      'width': 1200,
      'height': 630,
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return jsonLd;
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(path: string, title?: string) {
  const items = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': blogConfig.url.replace('/blog', ''),
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': 'Blog',
      'item': blogConfig.url,
    },
  ];

  if (title && path !== '/blog') {
    items.push({
      '@type': 'ListItem',
      'position': 3,
      'name': title,
      'item': `${blogConfig.url}${path}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items,
  };
}
