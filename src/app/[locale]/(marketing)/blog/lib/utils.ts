import { blogConfig } from '../content/config';

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format date for ISO string
export function formatDateISO(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

// Generate excerpt from content
export function generateExcerpt(content: string, length: number = blogConfig.content.excerptLength): string {
  // Check if content is a valid string
  if (typeof content !== 'string' || content === undefined) {
    return ''; // Return empty string if content is not valid
  }

  // Remove markdown syntax and HTML tags
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= length) {
    return plainText;
  }

  // Find the last complete word within the length limit
  const truncated = plainText.substring(0, length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  return lastSpaceIndex > 0
    ? `${truncated.substring(0, lastSpaceIndex)}...`
    : `${truncated}...`;
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = blogConfig.content.readingTimeWPM;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Format reading time
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate table of contents from markdown content
export function generateTableOfContents(content: string): Array<{ id: string; title: string; level: number }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Array<{ id: string; title: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    // Ensure match has the expected capturing groups
    if (match && match[1] && match[2]) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = slugify(title);

      toc.push({ id, title, level });
    }
  }

  return toc;
}

// Get related posts based on tags and category
export function getRelatedPosts(
  currentPost: { tags?: string[]; category?: string; slug: string },
  allPosts: Array<{ tags?: string[]; category?: string; slug: string }>,
  limit: number = 3,
): Array<{ tags?: string[]; category?: string; slug: string }> {
  const related = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map((post) => {
      let score = 0;

      // Same category gets higher score
      if (post.category && currentPost.category && post.category === currentPost.category) {
        score += 3;
      }

      // Shared tags get points
      if (post.tags && currentPost.tags) {
        const sharedTags = post.tags.filter(tag => currentPost.tags!.includes(tag));
        score += sharedTags.length;
      }

      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);

  return related;
}

// Validate blog post frontmatter
export function validatePostFrontmatter(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  }

  if (!data.date) {
    errors.push('Date is required');
  } else if (isNaN(Date.parse(data.date))) {
    errors.push('Date must be a valid date string');
  }

  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push('Published must be a boolean');
  }

  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (data.author && typeof data.author !== 'string') {
    errors.push('Author must be a string');
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate social sharing URLs
export function generateSocialUrls(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
  };
}

// Check if a post is recent (within last 30 days)
export function isRecentPost(dateString: string): boolean {
  const postDate = new Date(dateString);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return postDate > thirtyDaysAgo;
}

// Get estimated read time text
export function getReadTimeText(content: string): string {
  const minutes = calculateReadingTime(content);
  return formatReadingTime(minutes);
}
