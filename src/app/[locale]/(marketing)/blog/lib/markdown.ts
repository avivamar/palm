import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
// import remarkPrism from 'remark-prism'; // Temporarily disabled due to compatibility issues

const postsDirectory = path.join(process.cwd(), 'src/app/[locale]/(marketing)/blog/content/posts');

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  image?: string;
  readingTime?: number;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  image?: string;
  readingTime?: number;
};

// Calculate reading time based on word count
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Process markdown content
async function processMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown
    // .use(remarkPrism) // Syntax highlighting - temporarily disabled
    .use(remarkHtml, { sanitize: false })
    .process(content);

  return result.toString();
}

// Get all post slugs
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return fs.readdirSync(postsDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

// Get post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Process markdown content
    const processedContent = await processMarkdown(content);

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    return {
      slug,
      title: data.title || '',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      content: processedContent,
      author: data.author || '',
      category: data.category || '',
      tags: data.tags || [],
      published: data.published !== false, // Default to true
      featured: data.featured || false,
      image: data.image || '',
      readingTime,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// Get all posts
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const slugs = getPostSlugs();
  const posts: BlogPostMeta[] = [];

  for (const slug of slugs) {
    const post = await getPostBySlug(slug);
    if (post && post.published) {
      posts.push({
        slug: post.slug,
        title: post.title,
        date: post.date,
        excerpt: post.excerpt,
        author: post.author,
        category: post.category,
        tags: post.tags,
        published: post.published,
        featured: post.featured,
        image: post.image,
        readingTime: post.readingTime,
      });
    }
  }

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get featured posts
export async function getFeaturedPosts(): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.featured);
}

// Get posts by category
export async function getPostsByCategory(category: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post =>
    post.category?.toLowerCase() === category.toLowerCase(),
  );
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post =>
    post.tags?.some(t => t.toLowerCase() === tag.toLowerCase()),
  );
}

// Search posts
export async function searchPosts(query: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  const searchTerm = query.toLowerCase();

  return allPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm)
    || post.excerpt?.toLowerCase().includes(searchTerm)
    || post.category?.toLowerCase().includes(searchTerm)
    || post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)),
  );
}

// Get recent posts
export async function getRecentPosts(limit: number = 5): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, limit);
}
