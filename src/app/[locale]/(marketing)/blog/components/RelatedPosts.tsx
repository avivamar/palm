import Image from 'next/image';
import Link from 'next/link';
import { blogConfig } from '../content/config';
import { formatDate } from '../lib/utils';

type Post = {
  slug: string;
  title: string;
  excerpt?: string;
  description?: string;
  image?: string;
  date: string;
  author?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
};

type RelatedPostsProps = {
  currentPost: Post;
  allPosts: Post[];
};

export function RelatedPosts({ currentPost, allPosts }: RelatedPostsProps) {
  if (!blogConfig.relatedPosts.enabled) {
    return null;
  }

  // Filter out current post
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug);

  // Find related posts based on algorithm
  const relatedPosts = findRelatedPosts(currentPost, otherPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.slice(0, blogConfig.relatedPosts.maxCount).map(post => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              {post.image && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4 relative">
                  <Image
                    src={post.image}
                    alt={`Featured image for ${post.title}`}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="space-y-2">
                {post.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {post.category}
                  </span>
                )}

                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {(post.excerpt || post.description) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt || post.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{formatDate(post.date)}</span>
                  {post.readingTime && (
                    <span>
                      {post.readingTime}
                      {' '}
                      min read
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function findRelatedPosts(currentPost: Post, allPosts: Post[]): Post[] {
  const { algorithm } = blogConfig.relatedPosts;

  switch (algorithm) {
    case 'tags':
      return findPostsByTags(currentPost, allPosts);
    case 'category':
      return findPostsByCategory(currentPost, allPosts);
    case 'mixed':
      return findPostsMixed(currentPost, allPosts);
    default:
      return findPostsByTags(currentPost, allPosts);
  }
}

function findPostsByTags(currentPost: Post, allPosts: Post[]): Post[] {
  if (!currentPost.tags || currentPost.tags.length === 0) {
    return allPosts.slice(0, blogConfig.relatedPosts.maxCount);
  }

  const scored = allPosts.map((post) => {
    if (!post.tags) {
      return { post, score: 0 };
    }

    const commonTags = post.tags.filter(tag =>
      currentPost.tags!.includes(tag),
    ).length;

    return { post, score: commonTags };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.post);
}

function findPostsByCategory(currentPost: Post, allPosts: Post[]): Post[] {
  if (!currentPost.category) {
    return allPosts.slice(0, blogConfig.relatedPosts.maxCount);
  }

  const sameCategoryPosts = allPosts.filter(post =>
    post.category === currentPost.category,
  );

  if (sameCategoryPosts.length >= blogConfig.relatedPosts.maxCount) {
    return sameCategoryPosts;
  }

  // Fill remaining slots with other posts
  const otherPosts = allPosts.filter(post =>
    post.category !== currentPost.category,
  );

  return [...sameCategoryPosts, ...otherPosts];
}

function findPostsMixed(currentPost: Post, allPosts: Post[]): Post[] {
  const scored = allPosts.map((post) => {
    let score = 0;

    // Category match (higher weight)
    if (post.category && post.category === currentPost.category) {
      score += 3;
    }

    // Tag matches
    if (post.tags && currentPost.tags) {
      const commonTags = post.tags.filter(tag =>
        currentPost.tags!.includes(tag),
      ).length;
      score += commonTags;
    }

    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.post);
}
