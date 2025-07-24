import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { blogConfig } from './content/config';
import { BlogAdapter } from './lib/blog-adapter';
import { generateBlogMetadata, generateBreadcrumbJsonLd } from './lib/metadata';
import { formatDate } from './lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return generateBlogMetadata({
    title: blogConfig.title,
    description: blogConfig.description,
    path: '/blog',
    locale,
  });
}

export default async function BlogPage() {
  const allPosts = await BlogAdapter.getAllPosts();
  const featuredPosts = await BlogAdapter.getFeaturedPosts();
  const recentPosts = allPosts.slice(0, blogConfig.postsPerPage);

  // Generate structured data for blog listing page
  const breadcrumbJsonLd = generateBreadcrumbJsonLd('/blog', 'Blog');

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <JsonLd data={breadcrumbJsonLd} />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {blogConfig.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {blogConfig.description}
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map(post => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {post.image && (
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {post.category}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {post.excerpt || ''}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {post.author || blogConfig.author.name}
                          </span>
                          <span className="text-sm text-primary font-medium group-hover:underline">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Recent Posts */}
        <section>
          <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map(post => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    {post.image && (
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {post.category}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(post.date)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {post.excerpt || ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {post.author || blogConfig.author.name}
                        </span>
                        <span className="text-sm text-primary font-medium group-hover:underline">
                          Read more →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Load More */}
        {allPosts.length > blogConfig.postsPerPage && (
          <div className="text-center mt-12">
            <Link
              href="/blog/archive"
              className="inline-flex items-center px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
            >
              View All Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
