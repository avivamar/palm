import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export const metadata: Metadata = {
  title: 'Privacy Policy | Rolitt',
  description: 'Privacy Policy for Rolitt - Learn how we collect, use, and protect your personal information.',
};

async function getPrivacyContent() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'privacy.md');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return fileContents;
}

export default async function Privacy() {
  const content = await getPrivacyContent();

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <div className="prose prose-lg dark:prose-invert leading-relaxed space-y-6">
          <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
        </div>
      </div>
    </div>
  );
}
