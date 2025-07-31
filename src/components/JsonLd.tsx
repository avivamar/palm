import type { ReactNode } from 'react';

type Language = 'en' | 'es' | 'ja' | 'zh-HK';

type LocalizedContent = {
  [key in Language]: string;
};

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

type LocalizedOrganization = {
  name: LocalizedContent;
  description: LocalizedContent;
};

export function JsonLd({ data }: JsonLdProps): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// 组织结构化数据（支持多语言）
export function OrganizationJsonLd({ lang = 'en' }: { lang?: Language }): ReactNode {
  const localizedContent: LocalizedOrganization = {
    name: {
      'en': 'The Palmistry Life',
      'es': 'The Palmistry Life',
      'ja': 'The Palmistry Life',
      'zh-HK': 'The Palmistry Life',
    },
    description: {
      'en': 'Professional palmistry and chiromancy services - Learn palm reading, palmistry lines, and hand analysis',
      'es': 'Servicios profesionales de quiromancia y palmistry - Aprende lectura de palmas, líneas de palmistry y análisis de manos',
      'ja': 'プロの手相占いと手相学サービス - 手相占い、手相線、手の分析を学ぶ',
      'zh-HK': '專業手相學和手相占卜服務 - 學習手相占卜、手相線條和手部分析',
    },
  };

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@language': lang,
    'name': localizedContent.name[lang],
    'description': localizedContent.description[lang],
    'url': 'https://www.thepalmistry.life/',
    'knowsAbout': [
      'chiromancy palmistry',
      'palmistry',
      'face palmistry',
      'palmistry lines',
      'palmistry hand',
      'palmistry palm reading',
      'how to read palm lines palmistry guide',
      'palmistry chiromancy',
      'palmistry how to',
      'palmistry chart',
      'palmistry guide',
      'palmistry lines reading',
      'heart line palmistry',
      'palmistry crosses',
      'palmistry free reading',
      'palmistry heart line reading',
      'palmistry near me',
      'palmistry life line',
      'palmistry meaning',
    ],
  };

  return <JsonLd data={data} />;
}

// 产品结构化数据（支持多语言）
export function ProductJsonLd({ lang = 'en' }: { lang?: Language }): ReactNode {
  const localizedContent = {
    name: {
      'en': 'Professional Palmistry Reading Service',
      'es': 'Servicio Profesional de Lectura de Palmas',
      'ja': 'プロの手相占いサービス',
      'zh-HK': '專業手相占卜服務',
    },
    description: {
      'en': 'Expert palmistry and chiromancy analysis - Learn to read palm lines, understand palmistry charts, and discover your life path through professional palm reading',
      'es': 'Análisis experto de quiromancia y palmistry - Aprende a leer las líneas de las palmas, entiende los gráficos de palmistry y descubre tu camino de vida',
      'ja': '専門的な手相占いと手相学分析 - 手相線の読み方を学び、手相チャートを理解し、プロの手相占いで人生の道筋を発見',
      'zh-HK': '專業手相學和手相占卜分析 - 學習解讀手相線條，理解手相圖表，通過專業手相占卜發現人生道路',
    },
    serviceType: {
      'en': 'Palmistry and Chiromancy Services',
      'es': 'Servicios de Quiromancia y Palmistry',
      'ja': '手相占いと手相学サービス',
      'zh-HK': '手相學和手相占卜服務',
    },
  };

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@language': lang,
    'name': localizedContent.name[lang],
    'description': localizedContent.description[lang],
    'serviceType': localizedContent.serviceType[lang],
    'provider': {
      '@type': 'Organization',
      'name': 'The Palmistry Life',
      'url': 'https://www.thepalmistry.life/',
    },
    'areaServed': 'Worldwide',
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': 'Palmistry Services',
      'itemListElement': [
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'Palm Lines Reading',
            'description': 'Professional analysis of heart line, life line, and head line palmistry',
          },
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'Chiromancy Analysis',
            'description': 'Complete palmistry chart interpretation and hand analysis',
          },
        },
        {
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            'name': 'Palmistry Guide',
            'description': 'Learn how to read palm lines with our comprehensive palmistry guide',
          },
        },
      ],
    },
  };

  return <JsonLd data={data} />;
}

// 面包屑导航结构化数据（支持多语言）
export function BreadcrumbJsonLd({
  items,
  lang = 'en',
}: {
  items: {
    name: LocalizedContent | string;
    url: string;
  }[];
  lang?: Language;
}): ReactNode {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': typeof item.name === 'string' ? item.name : item.name[lang],
    'item': item.url.includes('://') ? item.url : item.url,
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@language': lang,
    itemListElement,
  };

  return <JsonLd data={data} />;
}

// FAQ结构化数据（支持多语言）
export function FaqJsonLd({
  questions,
  lang = 'en',
}: {
  questions: {
    question: LocalizedContent;
    answer: LocalizedContent;
    keywords?: string;
  }[];
  lang?: Language;
}): ReactNode {
  const mainEntity = questions.map(q => ({
    '@type': 'Question',
    'name': q.question[lang],
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': q.answer[lang],
      ...(q.keywords && { keywords: q.keywords }),
    },
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@language': lang,
    mainEntity,
  };

  return <JsonLd data={data} />;
}

// 文章结构化数据（支持多语言）
export function ArticleJsonLd({
  article,
  lang = 'en',
}: {
  article: {
    headline: LocalizedContent;
    description: LocalizedContent;
    image: string;
    datePublished: string;
    dateModified: string;
    author: string;
    keywords?: string;
  };
  lang?: Language;
}): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@language': lang,
    'headline': article.headline[lang],
    'description': article.description[lang],
    'image': article.image,
    'datePublished': article.datePublished,
    'dateModified': article.dateModified,
    ...(article.keywords && { keywords: article.keywords }),
    'author': {
      '@type': 'Person',
      'name': article.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'The Palmistry Life',
      'url': 'https://www.thepalmistry.life/',
    },
  };

  return <JsonLd data={data} />;
}

// 技术文章结构化数据（支持多语言）
export function TechnicalArticleJsonLd({
  article,
  lang = 'en',
}: {
  article: {
    headline: LocalizedContent;
    description: LocalizedContent;
    image: string;
    datePublished: string;
    dateModified: string;
    author: string;
    keywords?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  lang?: Language;
}): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@language': lang,
    'headline': article.headline[lang],
    'description': article.description[lang],
    'image': article.image,
    'datePublished': article.datePublished,
    'dateModified': article.dateModified,
    ...(article.keywords && { keywords: article.keywords }),
    ...(article.difficulty && { proficiencyLevel: article.difficulty }),
    'author': {
      '@type': 'Person',
      'name': article.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'The Palmistry Life',
      'url': 'https://www.thepalmistry.life/',
    },
  };

  return <JsonLd data={data} />;
}

// 本地商业结构化数据（支持多语言）
export function LocalBusinessJsonLd({
  business,
  lang = 'en',
}: {
  business: {
    name: LocalizedContent;
    description: LocalizedContent;
    serviceType: LocalizedContent;
  };
  lang?: Language;
}): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@language': lang,
    'name': business.name[lang],
    'description': business.description[lang],
    'serviceType': business.serviceType[lang],
  };

  return <JsonLd data={data} />;
}

// 搜索框结构化数据（支持多语言）
export function SearchBoxJsonLd({
  searchUrl,
  lang = 'en',
}: {
  searchUrl: string;
  lang?: Language;
}): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@language': lang,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// 事件结构化数据（支持多语言）
export function EventJsonLd({
  event,
  lang = 'en',
}: {
  event: {
    name: LocalizedContent;
    description: LocalizedContent;
    startDate: string;
    endDate: string;
    eventType: LocalizedContent;
  };
  lang?: Language;
}): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@language': lang,
    'name': event.name[lang],
    'description': event.description[lang],
    'startDate': event.startDate,
    'endDate': event.endDate,
    'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
    'eventStatus': 'https://schema.org/EventScheduled',
    'organizer': {
      '@type': 'Organization',
      'name': 'The Palmistry Life',
      'url': 'https://www.thepalmistry.life/',
    },
  };

  return <JsonLd data={data} />;
}
