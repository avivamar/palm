import { Metadata } from 'next';
import { PalmHeroSection } from '@/components/palm/PalmHeroSection';
import { PalmHowItWorksSection } from '@/components/palm/PalmHowItWorksSection';
import { PalmFeaturesSection } from '@/components/palm/PalmFeaturesSection';
import { PalmPricingSection } from '@/components/palm/PalmPricingSection';
import { PalmFAQSection } from '@/components/palm/PalmFAQSection';
import { PalmContactSection } from '@/components/palm/PalmContactSection';

export const metadata: Metadata = {
  title: 'Palm AI - AI-Powered Palm Reading | Instant Insights',
  description: 'Discover your future with AI-powered palm reading. Get instant insights into love, career, health, and personality through advanced palmistry analysis.',
  keywords: ['palm reading', 'AI palmistry', 'fortune telling', 'personality analysis', 'astrology', 'divination'],
  openGraph: {
    title: 'Palm AI - AI-Powered Palm Reading',
    description: 'Discover your future with AI-powered palm reading. Get instant insights into love, career, health, and personality.',
    type: 'website',
    images: [
      {
        url: '/images/palm-ai-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Palm AI - AI-Powered Palm Reading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palm AI - AI-Powered Palm Reading',
    description: 'Discover your future with AI-powered palm reading. Get instant insights into love, career, health, and personality.',
    images: ['/images/palm-ai-twitter.jpg'],
  },
};

export default function PalmAIPage() {
  return (
    <main className="min-h-screen">
      <PalmHeroSection />
      <PalmHowItWorksSection />
      <PalmFeaturesSection />
      <PalmPricingSection />
      <PalmFAQSection />
      <PalmContactSection />
    </main>
  );
}