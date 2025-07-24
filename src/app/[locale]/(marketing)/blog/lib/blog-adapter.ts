import type { BlogPost, BlogPostMeta } from './markdown';

import * as markdownSource from './markdown';
import * as notionSource from './notion';

// Blog data source type
type BlogDataSource = 'markdown' | 'notion';

// Determine which data source to use based on environment variables
function getDataSource(): BlogDataSource {
  // If Notion credentials are configured, use Notion; otherwise use Markdown
  if (process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID) {
    return 'notion';
  }
  return 'markdown';
}

// Unified blog data adapter
export class BlogAdapter {
  private static dataSource: BlogDataSource = getDataSource();

  // Get all posts
  static async getAllPosts(): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getAllPosts();
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getAllPosts();
      }
    }
    return await markdownSource.getAllPosts();
  }

  // Get post by slug
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getPostBySlug(slug);
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getPostBySlug(slug);
      }
    }
    return await markdownSource.getPostBySlug(slug);
  }

  // Get featured posts
  static async getFeaturedPosts(): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getFeaturedPosts();
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getFeaturedPosts();
      }
    }
    return await markdownSource.getFeaturedPosts();
  }

  // Get posts by category
  static async getPostsByCategory(category: string): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getPostsByCategory(category);
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getPostsByCategory(category);
      }
    }
    return await markdownSource.getPostsByCategory(category);
  }

  // Get posts by tag
  static async getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getPostsByTag(tag);
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getPostsByTag(tag);
      }
    }
    return await markdownSource.getPostsByTag(tag);
  }

  // Search posts
  static async searchPosts(query: string): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.searchPosts(query);
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.searchPosts(query);
      }
    }
    return await markdownSource.searchPosts(query);
  }

  // Get recent posts
  static async getRecentPosts(limit: number = 5): Promise<BlogPostMeta[]> {
    if (this.dataSource === 'notion') {
      try {
        return await notionSource.getRecentPosts(limit);
      } catch (error) {
        console.warn('Notion source failed, falling back to markdown:', error);
        return await markdownSource.getRecentPosts(limit);
      }
    }
    return await markdownSource.getRecentPosts(limit);
  }

  // Get current data source
  static getDataSourceType(): BlogDataSource {
    return this.dataSource;
  }

  // Force refresh data source (useful for development)
  static refreshDataSource(): void {
    this.dataSource = getDataSource();
  }
}
