export const blogConfig = {
  // Site information
  title: 'Blog',
  description: 'Latest insights, updates and thoughts from the Thepalmistrylife team.',
  url: 'https://www.thepalmistrylife.com/blog',

  // Author information
  author: {
    name: 'Thepalmistrylife Team',
    email: 'support@thepalmistrylife.com',
    twitter: '@thepalmistrylifeai',
    url: 'https://www.thepalmistrylife.com/about',
    image: 'https://www.thepalmistrylife.com/images/team/thepalmistrylife-team.jpg',
    description: 'The Thepalmistrylife team consists of AI researchers, engineers, and designers passionate about creating emotional AI companions.',
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
    'thepalmistrylife',
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
      siteName: 'Blog',
    },
    schema: {
      organization: {
        name: 'Thepalmistrylife Inc.',
        url: 'https://www.thepalmistrylife.com',
        logo: 'https://www.thepalmistrylife.com/palmlogo.svg',
        sameAs: [
          'https://twitter.com/thepalmistrylifeai',
          'https://linkedin.com/company/thepalmistrylife',
          'https://github.com/thepalmistrylife',
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
