import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lazy, Suspense } from 'react';
import { CodeHighlighter } from '@/components/CodeHighlighter';
import { JsonLd } from '@/components/JsonLd';
import Prose from '@/components/prose';
import { BlogAdapter } from '../lib/blog-adapter';
import { generateBlogJsonLd, generateBlogMetadata, generateBreadcrumbJsonLd } from '../lib/metadata';
import { formatDate } from '../lib/utils';

// 延迟加载重型组件
const RelatedPosts = lazy(() => import('../components/RelatedPosts').then(m => ({ default: m.RelatedPosts })));

// 加载状态组件
function ContentLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    </div>
  );
}

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await BlogAdapter.getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await BlogAdapter.getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return generateBlogMetadata({
    title: post.title,
    description: post.excerpt || `Read ${post.title} on Rolitt Blog`,
    path: `/blog/${post.slug}`,
    publishedTime: post.date,
    authors: post.author ? [post.author] : undefined,
    tags: post.tags,
    category: post.category,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await BlogAdapter.getPostBySlug(slug);
  const allPosts = await BlogAdapter.getAllPosts();

  if (!post) {
    notFound();
  }

  // Generate structured data
  const blogJsonLd = generateBlogJsonLd({
    title: post.title,
    description: post.excerpt || `Read ${post.title} on Rolitt Blog`,
    image: post.image,
    path: `/blog/${post.slug}`,
    authors: post.author ? [post.author] : undefined,
    tags: post.tags,
    publishedTime: post.date,
    category: post.category,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(`/blog/${post.slug}`, post.title);

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto">
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium" aria-current="page">{post.title}</li>
            </ol>
          </nav>
        </div>

        <article className="max-w-4xl mx-auto break-words">
          {/* Header */}
          <header className="mb-12">
            {post.image && (
              <div className="aspect-video mb-8 rounded-lg overflow-hidden bg-muted relative">
                <Image
                  src={post.image}
                  alt={`Featured image for ${post.title}`}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            <div className="space-y-4">
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {post.category}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {post.author || 'Rolitt Team'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(post.date)}
                </div>
                {post.readingTime && (
                  <div className="text-sm text-muted-foreground">
                    {post.readingTime}
                    {' '}
                    min read
                  </div>
                )}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      #
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <Prose className="prose-lg">
            <Suspense fallback={<ContentLoader />}>
              <MarkdownContent post={post} />
            </Suspense>
          </Prose>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t">
            <div className="flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center text-primary hover:underline"
              >
                ← Back to Blog
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Share:</span>
                <div className="flex gap-2">
                  <Link
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://www.rolitt.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Link>
                  <Link
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.rolitt.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </footer>

          {/* Related Posts */}
          <Suspense fallback={<ContentLoader />}>
            <RelatedPosts currentPost={post} allPosts={allPosts} />
          </Suspense>
        </article>
      </div>
    </div>
  );
}

// 分离的 Markdown 内容组件用于延迟加载
async function MarkdownContent({ post }: { post: any }) {
  const { default: ReactMarkdown } = await import('react-markdown');
  const { default: remarkGfm } = await import('remark-gfm');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        img: ({ src, alt }) => {
          const imageSrc = typeof src === 'string' ? src : '';
          const altText = alt || `Image from ${post.title}`;

          return (
            <span className="block relative w-full" style={{ aspectRatio: '16/9' }}>
              <Image
                src={imageSrc}
                alt={altText}
                width={800}
                height={450}
                className="w-full h-full object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              />
            </span>
          );
        },
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';

          // 检查是否为内联代码（没有语言类名且children是字符串）
          const isInline = !className && typeof children === 'string';

          if (isInline) {
            return (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-medium text-primary dark:text-primary-foreground"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <CodeHighlighter language={language || 'text'}>
              {String(children)}
            </CodeHighlighter>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 bg-gray-50 dark:bg-gray-800/50 py-4 px-6 my-6 rounded-r-lg italic text-gray-600 dark:text-gray-400">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="my-6 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
            {children}
          </td>
        ),
        h1: ({ children }) => (
          <h1 className="text-4xl font-semibold mb-8 mt-12 text-gray-900 dark:text-gray-100 tracking-tight">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-semibold mb-6 mt-10 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 tracking-tight">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-semibold mb-4 mt-8 text-gray-900 dark:text-gray-100 tracking-tight">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-6 space-y-2 text-gray-700 dark:text-gray-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-6 space-y-2 text-gray-700 dark:text-gray-300">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">
            {children}
          </li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary font-medium no-underline border-b border-primary/30 hover:border-primary transition-colors duration-200"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        hr: () => (
          <hr className="my-8 border-gray-200 dark:border-gray-700" />
        ),
      }}
    >
      {post.content || ''}
    </ReactMarkdown>
  );
}
