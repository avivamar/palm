import type { BlogPost, BlogPostMeta } from './markdown';

import { isFullPage } from '@notionhq/client';

// We only want to initialize the Notion client on the server
const isServerEnvironment = typeof window === 'undefined';

// Notion client and converter (initialized conditionally)
let notion: any = null;
let n2m: any = null;
let isInitialized = false;

async function _initializeNotionClient() {
  if (isInitialized || !isServerEnvironment || !process.env.NOTION_TOKEN) {
    return isInitialized;
  }

  try {
    const { Client } = await import('@notionhq/client');
    const { NotionToMarkdown } = await import('notion-to-md');

    notion = new Client({
      auth: process.env.NOTION_TOKEN,
      timeoutMs: 30000,
    });

    n2m = new NotionToMarkdown({ notionClient: notion });
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('Failed to initialize Notion client:', error);
    return false;
  }
}

// Notion database ID for blog posts
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

// Helper function to validate and clean database ID
function validateDatabaseId(databaseId: string): string {
  if (!databaseId) {
    console.warn('NOTION_DATABASE_ID is not configured');
    // 在生产环境中返回一个默认值以防止构建失败
    if (process.env.NODE_ENV === 'production') {
      return 'default-database-id';
    }
    throw new Error('NOTION_DATABASE_ID is not configured');
  }

  // Remove any non-ASCII characters and ensure it's a valid UUID format
  const cleanId = databaseId.replace(/[^a-z0-9-]/gi, '');

  // Notion database IDs should be 32 characters (UUID without hyphens) or 36 characters (UUID with hyphens)
  if (cleanId.length !== 32 && cleanId.length !== 36) {
    console.warn('Database ID format may be invalid:', cleanId);
  }

  return cleanId;
}

type NotionBlogPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  image?: string;
  content?: string;
  readingTime?: number;
};

// Calculate reading time based on word count
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Extract properties from Notion page
function extractPageProperties(page: any): Omit<NotionBlogPost, 'content'> {
  const properties = page.properties;

  // Helper function to safely extract text and handle encoding
  const safeExtractText = (textProperty: any): string => {
    try {
      const text = textProperty?.[0]?.plain_text || '';
      // Ensure proper UTF-8 encoding for Chinese characters
      return text.toString();
    } catch (error) {
      console.warn('Error extracting text property:', error);
      return '';
    }
  };

  // Helper function to safely extract select name
  const safeExtractSelectName = (selectProperty: any): string => {
    try {
      return selectProperty?.name?.toString() || '';
    } catch (error) {
      console.warn('Error extracting select property:', error);
      return '';
    }
  };

  return {
    id: page.id,
    title: safeExtractText(properties.Title?.title),
    slug: safeExtractText(properties.Slug?.rich_text),
    date: properties.Date?.date?.start || new Date().toISOString(),
    excerpt: safeExtractText(properties.Excerpt?.rich_text),
    author: safeExtractText(properties.Author?.rich_text) || 'Rolitt Team',
    category: safeExtractSelectName(properties.Category?.select),
    tags: properties.Tags?.multi_select?.map((tag: any) => safeExtractSelectName(tag)) || [],
    published: properties.Published?.checkbox || false,
    featured: safeExtractSelectName(properties.Featured?.select) === 'true',
    image: properties.Image?.files?.[0]?.file?.url || properties.Image?.files?.[0]?.external?.url || undefined,
  };
}

// Get all published posts from Notion
export async function getAllNotionPosts(): Promise<BlogPostMeta[]> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty posts array');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5, // Default reading time
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts from Notion:', error);
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
}

// Get a single post by slug from Notion
export async function getNotionPostBySlug(slug: string): Promise<BlogPost | null> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion || !n2m) {
    console.warn('Notion client not available, returning null/empty result');
    return null;
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        and: [
          {
            property: 'Slug',
            rich_text: {
              equals: slug,
            },
          },
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const pageResult = response.results[0];

    if (!pageResult || !isFullPage(pageResult)) {
      console.warn(`Post with slug '${slug}' not found or is not a full page.`);
      return null;
    }

    const postData = extractPageProperties(pageResult);

    // Get page content and convert to markdown
    const mdblocks = await n2m.pageToMarkdown(pageResult.id);
    const mdString = n2m.toMarkdownString(mdblocks);

    const content = mdString.parent || '';

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    return {
      slug: postData.slug,
      title: postData.title,
      date: postData.date,
      excerpt: postData.excerpt,
      content,
      author: postData.author,
      category: postData.category,
      tags: postData.tags,
      published: postData.published,
      featured: postData.featured,
      image: postData.image,
      readingTime,
    };
  } catch (error) {
    console.error(`Error fetching post ${slug} from Notion:`, error);
    // 在生产构建中，返回 null 以防止构建失败
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    throw error;
  }
}

// Get featured posts from Notion
export async function getFeaturedNotionPosts(): Promise<BlogPostMeta[]> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty featured posts array');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Featured',
            select: {
              equals: 'true',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error('Error fetching featured posts from Notion:', error);
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
}

// Get posts by category from Notion
export async function getNotionPostsByCategory(category: string): Promise<BlogPostMeta[]> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty category posts array');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Category',
            select: {
              equals: category,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error fetching posts by category ${category} from Notion:`, error);
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
}

// Search posts in Notion
export async function searchNotionPosts(query: string): Promise<BlogPostMeta[]> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty search results');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            or: [
              {
                property: 'Title',
                title: {
                  contains: query,
                },
              },
              {
                property: 'Excerpt',
                rich_text: {
                  contains: query,
                },
              },
            ],
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error searching posts with query ${query} from Notion:`, error);
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
}

// Get recent posts from Notion
export async function getRecentNotionPosts(limit: number = 5): Promise<BlogPostMeta[]> {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty recent posts array');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
      page_size: limit,
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error fetching recent posts from Notion:`, error);
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
}

// Export functions with expected names for blog-adapter compatibility
export const getAllPosts = getAllNotionPosts;
export const getPostBySlug = getNotionPostBySlug;
export const getFeaturedPosts = getFeaturedNotionPosts;
export const getPostsByCategory = getNotionPostsByCategory;
export const getPostsByTag = async (tag: string): Promise<BlogPostMeta[]> => {
  const initialized = await _initializeNotionClient();
  if (!initialized || !notion) {
    console.warn('Notion client not available, returning empty tag posts array');
    return [];
  }

  try {
    const cleanDatabaseId = validateDatabaseId(DATABASE_ID);
    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Tags',
            multi_select: {
              contains: tag,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts: BlogPostMeta[] = [];

    for (const page of response.results) {
      if (isFullPage(page)) {
        const postData = extractPageProperties(page);
        posts.push({
          slug: postData.slug,
          title: postData.title,
          date: postData.date,
          excerpt: postData.excerpt,
          author: postData.author,
          category: postData.category,
          tags: postData.tags,
          published: postData.published,
          featured: postData.featured,
          image: postData.image,
          readingTime: 5,
        });
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error fetching posts by tag ${tag} from Notion:`, error);
    // 在生产构建中，返回空数组以防止构建失败
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    throw error;
  }
};
export const searchPosts = searchNotionPosts;
export const getRecentPosts = getRecentNotionPosts;
