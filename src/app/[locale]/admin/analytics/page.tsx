/**
 * Conversion Analytics Admin Page
 * View funnel analysis and user behavior insights
 */

import { ConversionTracking } from '@/components/analytics/ConversionTrackingSimple';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConversionAnalyticsPage({ params }: Props) {
  await params; // Consume params to satisfy TypeScript

  return (
    <div className="container mx-auto py-6">
      <ConversionTracking />
    </div>
  );
}
