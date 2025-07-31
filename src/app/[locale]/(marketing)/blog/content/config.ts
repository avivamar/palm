export const blogConfig = {
  // Site information
  title: 'Rolitt Blog',
  description: 'Latest insights, updates and thoughts from the Rolitt team.',
  url: 'https://www.rolitt.com/blog',

  // Author information
  author: {
    name: 'Rolitt Team',
    email: 'support@rolitt.com',
    twitter: '@rolittai',
    url: 'https://www.rolitt.com/about',
    image: 'https://www.rolitt.com/images/team/rolitt-team.jpg',
    description: 'The Rolitt team consists of AI researchers, engineers, and designers passionate about creating emotional AI companions.',
  },

  // Blog settings
  postsPerPage: 10,

  // Categories
  categories: [
    'Technology',
    'Product Updates',
    'Industry Insights',
    'Company News',
    'Tutorials',
    'Case Studies',
  ],

  // Default tags
  defaultTags: [
    'rolitt',
    'ai hardware',
    'innovation',
    'business',
  ],

  // Social sharing
  social: {
    twitter: true,
    linkedin: true,
    facebook: true,
    email: true,
  },

  // SEO settings
  seo: {
    defaultImage: '/images/twittercard.webp',
    twitterCard: 'summary_large_image',
    locale: 'en_US',
    robots: {
      'index': true,
      'follow': true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      type: 'website',
      siteName: 'Rolitt Blog',
    },
    schema: {
      organization: {
        name: 'Rolitt Inc.',
        url: 'https://www.rolitt.com',
        logo: 'https://www.rolitt.com/palmlogo.svg',
        sameAs: [
          'https://twitter.com/rolittai',
          'https://linkedin.com/company/rolitt',
          'https://github.com/rolitt',
        ],
      },
    },
  },

  // Content settings
  content: {
    excerptLength: 160,
    readingTimeWPM: 200, // Words per minute for reading time calculation
  },

  // Navigation
  navigation: {
    showBackToBlog: true,
    showPrevNext: true,
    showTableOfContents: true,
    showBreadcrumbs: true,
    showRelatedPosts: true,
  },

  // Related posts settings
  relatedPosts: {
    enabled: true,
    maxCount: 3,
    algorithm: 'tags', // 'tags' | 'category' | 'mixed'
  },

  // Performance settings
  performance: {
    lazyLoadImages: true,
    optimizeImages: true,
    preloadCriticalImages: true,
  },
};

export type BlogConfig = typeof blogConfig;
