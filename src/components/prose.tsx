import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Prose({ children, className }: Props) {
  return (
    <div
      className={cn(
        // Base prose styles with better readability
        'prose prose-gray dark:prose-invert max-w-none',
        // Typography improvements for blog content
        'prose-base md:prose-lg',
        'prose-p:leading-relaxed prose-p:mb-6',
        'prose-p:text-gray-700 dark:prose-p:text-gray-300',
        // Headings with better spacing and hierarchy
        'prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
        'prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12',
        'prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2',
        'prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8',
        'prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6',
        'prose-h5:text-lg prose-h5:mb-2 prose-h5:mt-4',
        'prose-h6:text-base prose-h6:mb-2 prose-h6:mt-4',
        // Links with brand colors
        'prose-a:text-primary prose-a:font-medium prose-a:no-underline',
        'prose-a:border-b prose-a:border-primary/30 hover:prose-a:border-primary',
        'prose-a:transition-colors prose-a:duration-200',
        // Lists with better spacing
        'prose-ul:my-6 prose-ol:my-6',
        'prose-li:my-2 prose-li:leading-relaxed',
        'prose-li:text-gray-700 dark:prose-li:text-gray-300',
        // Blockquotes with brand styling
        'prose-blockquote:border-l-4 prose-blockquote:border-primary/50',
        'prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800/50',
        'prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6',
        'prose-blockquote:rounded-r-lg prose-blockquote:italic',
        'prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400',
        // Code styling
        'prose-code:text-sm prose-code:font-medium',
        'prose-code:bg-gray-100 dark:prose-code:bg-gray-800',
        'prose-code:px-2 prose-code:py-1 prose-code:rounded',
        'prose-code:text-primary dark:prose-code:text-primary-foreground',
        'prose-code:before:content-none prose-code:after:content-none',
        // Pre blocks with enhanced styling
        'prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950',
        'prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700',
        'prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-6',
        'prose-pre:overflow-x-auto prose-pre:text-sm',
        'prose-pre:shadow-lg dark:prose-pre:shadow-none',
        // Tables
        'prose-table:my-6 prose-table:border-collapse',
        'prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600',
        'prose-th:bg-gray-50 dark:prose-th:bg-gray-800',
        'prose-th:px-4 prose-th:py-2 prose-th:font-semibold',
        'prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600',
        'prose-td:px-4 prose-td:py-2',
        // Images
        'prose-img:rounded-lg prose-img:shadow-md prose-img:my-6',
        // HR
        'prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-8',
        // Strong and emphasis
        'prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold',
        'prose-em:text-gray-700 dark:prose-em:text-gray-300',
        className,
      )}
    >
      {children}
    </div>
  );
}
