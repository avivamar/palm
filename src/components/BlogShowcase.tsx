import type { BlogPostMeta } from '@/app/[locale]/(marketing)/blog/lib/markdown';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { formatDate } from '@/app/[locale]/(marketing)/blog/lib/utils';

type BlogShowcaseProps = {
  posts: BlogPostMeta[];
};

export default async function BlogShowcase({ posts }: BlogShowcaseProps) {
  const t = await getTranslations('BlogShowcase');

  if (!posts || posts.length === 0) {
    return null;
  }

  // 取前3篇文章用于展示
  const featuredPosts = posts.slice(0, 3);

  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPosts.map(post => (
            <article
              key={post.slug}
              className="group cursor-pointer hover:-translate-y-2 transition-transform duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden h-full">
                  {/* Image */}
                  {post.image && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      {post.category && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {post.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{post.author || 'Rolitt Team'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
                        <span>{t('read_more')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <span>{t('view_all')}</span>
              <div className="group-hover:translate-x-1 transition-transform duration-200">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
