import { Metadata } from 'next';
import PalmResultsClient from './client';

interface PageProps {
  params: {
    sessionId: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Palm Reading Results - AI Hand Analysis',
    description: 'View your personalized palm reading analysis results powered by AI technology.',
  };
}

export default function PalmResultsPage({ params }: PageProps) {
  return <PalmResultsClient />;
}