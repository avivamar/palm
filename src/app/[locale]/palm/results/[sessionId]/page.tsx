import type { Metadata } from 'next';
import PalmResultsClient from './client';

type PageProps = {
  params: Promise<{
    sessionId: string;
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sessionId: _sessionId, locale: _locale } = await params;
  return {
    title: 'Palm Reading Results - AI Hand Analysis',
    description: 'View your personalized palm reading analysis results powered by AI technology.',
  };
}

export default async function PalmResultsPage({ params }: PageProps) {
  const { sessionId: _sessionId, locale: _locale } = await params;
  return <PalmResultsClient />;
}