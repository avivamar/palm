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
      'en': 'Rolitt Inc.',
      'es': 'Rolitt Inc.',
      'ja': 'Rolitt Inc',
      'zh-HK': 'Rolitt Inc.',
    },
    description: {
      'en': 'Global leader in AI-powered emotional companion solutions, specializing in smart plush toys with advanced machine learning capabilities.',
      'es': 'Líder global en soluciones de compañía emocional impulsadas por IA, especializado en juguetes de peluche inteligentes con capacidades avanzadas de aprendizaje automático.',
      'ja': '感情認識と機械学習技術を備えたスマートなAIコンパニオンのグローバルリーダー',
      'zh-HK': '全球領先的AI情感陪伴解決方案供應商，專注於具有先進機器學習能力的智能毛絨玩具',
    },
  };

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@language': lang,
    'name': localizedContent.name[lang],
    'description': localizedContent.description[lang],
    'url': 'https://www.rolitt.com',
    'logo': 'https://www.rolitt.com/logo.svg',
    'foundingDate': '2024',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '1111B S Governors Ave STE 20948',
      'addressLocality': 'Dover',
      'addressRegion': 'DE',
      'postalCode': '19904',
      'addressCountry': 'US',
    },
    'sameAs': [
      'https://x.com/Rolittai',
      'https://www.facebook.com/profile.php?id=61560959570699',
      'https://www.linkedin.com/company/rolitt',
      'https://www.instagram.com/rolittrobot/',
      'https://www.youtube.com/@RolittRobot',
      'https://github.com/rolittai',
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+1 (302) 444-2859',
      'contactType': 'customer service',
      'email': 'support@rolitt.com',
      'availableLanguage': ['English', 'Japanese', 'Chinese', 'Spanish'],
      'areaServed': ['United States', 'Japan', 'China', 'Spain', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore'],
    },
    'knowsAbout': [
      'Artificial Intelligence',
      'Emotional Computing',
      'Machine Learning',
      'Natural Language Processing',
    ],
  };

  return <JsonLd data={data} />;
}

// 产品结构化数据（支持多语言）
export function ProductJsonLd({ lang = 'en' }: { lang?: Language }): ReactNode {
  const localizedContent = {
    name: {
      'en': 'Rolitt AI Companion - Smart Emotional Plush Toy',
      'es': 'Rolitt Compañero AI - Juguete de Peluche Emocional Inteligente',
      'ja': 'Rolitt AIコンパニオン - スマート感情認識ぬいぐるみ',
      'zh-HK': 'Rolitt AI伴侶 - 智能情感識別毛絨玩具',
    },
    description: {
      'en': 'Rolitt is a next-generation AI companion that combines emotional recognition, natural language processing, and machine learning technologies. Designed for both adults seeking emotional connection and children\'s educational development.',
      'es': 'Rolitt es un compañero de IA de próxima generación que combina reconocimiento emocional, procesamiento de lenguaje natural y tecnologías de aprendizaje automático. Diseñado tanto para adultos que buscan conexión emocional como para el desarrollo educativo de los niños.',
      'ja': 'Rolittは、感情認識、自然言語処理、機械学習技術を組み合わせた次世代のAIコンパニオンです。感情的なつながりを求める大人と子供の教育発達の両方のために設計されています。',
      'zh-HK': 'Rolitt是一款結合情感識別、自然語言處理和機器學習技術的下一代AI伴侶。專為尋求情感連接的成人和兒童教育發展而設計。',
    },
  };

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@language': lang,
    'name': localizedContent.name[lang],
    'image': [
      'https://www.rolitt.com/app/rolitt-app-mockup.png',
      'https://www.rolitt.com/images/rolitt-ai-plush-toy.png',
    ],
    'description': localizedContent.description[lang],
    'brand': {
      '@type': 'Brand',
      'name': 'Rolitt',
      'description': 'Pioneer in AI-powered emotional companion technology',
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': '299.99',
      'availability': 'https://schema.org/PreOrder',
      'url': `https://www.rolitt.com/${lang}/pre-order`,
      'itemCondition': 'https://schema.org/NewCondition',
      'priceValidUntil': '2025-12-31',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'bestRating': '5',
      'worstRating': '1',
      'reviewCount': '150',
    },
    'keywords': 'AI plush toy, smart emotional companion, interactive stuffed animal, customizable smart plush doll',
    'feature': [
      'Real-time emotion recognition',
      'Multilingual conversation support',
      'Child-safe privacy protection',
      'Machine learning adaptation',
    ],
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
    'item': item.url.includes('://') ? item.url : `https://www.rolitt.com/${lang}${item.url}`,
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
      'name': 'Rolitt',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.rolitt.com/rolittlogo.svg',
      },
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
    author: {
      name: string;
      jobTitle?: string;
    };
    proficiencyLevel?: string;
    dependencies?: string;
    keywords?: string;
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
    ...(article.proficiencyLevel && { proficiencyLevel: article.proficiencyLevel }),
    ...(article.dependencies && { dependencies: article.dependencies }),
    'author': {
      '@type': 'Person',
      'name': article.author.name,
      ...(article.author.jobTitle && { jobTitle: article.author.jobTitle }),
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Rolitt',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.rolitt.com/rolittlogo.svg',
      },
    },
  };

  return <JsonLd data={data} />;
}

// 本地企业结构化数据（支持多语言）
export function LocalBusinessJsonLd({ lang = 'en' }: { lang?: Language }): ReactNode {
  const localizedContent = {
    name: {
      'en': 'Rolitt Inc.',
      'es': 'Rolitt Inc.',
      'ja': 'Rolitt Inc',
      'zh-HK': 'Rolitt Inc.',
    },
  };

  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@language': lang,
    'name': localizedContent.name[lang],
    'image': 'https://www.rolitt.com/rolittlogo.svg',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '1111B S Governors Ave STE 20948',
      'addressLocality': 'Dover',
      'addressRegion': 'DE',
      'postalCode': '19904',
      'addressCountry': 'US',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '39.449889',
      'longitude': '-75.716742',
    },
    'url': `https://www.rolitt.com/${lang}`,
    'telephone': '+1 (302) 444-2859',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '16:00',
      },
    ],
  };

  return <JsonLd data={data} />;
}

// 搜索框结构化数据（支持多语言）
export function SearchBoxJsonLd({ lang = 'en' }: { lang?: Language }): ReactNode {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@language': lang,
    'url': `https://www.rolitt.com/${lang}`,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `https://www.rolitt.com/${lang}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// 活动结构化数据（支持多语言）
export function EventJsonLd({
  event,
  lang = 'en',
}: {
  event: {
    name: LocalizedContent;
    description: LocalizedContent;
    startDate: string;
    endDate: string;
    location: LocalizedContent;
    image: string;
    keywords?: string;
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
    ...(event.keywords && { keywords: event.keywords }),
    'location': {
      '@type': 'Place',
      'name': event.location[lang],
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '1111B S Governors Ave STE 20948',
        'addressLocality': 'Dover',
        'addressRegion': 'DE',
        'postalCode': '19904',
        'addressCountry': 'US',
      },
    },
    'image': event.image,
    'organizer': {
      '@type': 'Organization',
      'name': 'Rolitt',
      'url': `https://www.rolitt.com/${lang}`,
    },
  };

  return <JsonLd data={data} />;
}
