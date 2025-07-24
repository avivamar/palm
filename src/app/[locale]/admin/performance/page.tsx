/**
 * Performance Monitoring Page
 * Real-time monitoring of payment flow performance
 */

import PaymentPerformanceMonitor from '@/components/admin/performance/PaymentPerformanceMonitorSimple';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PerformancePage({ params }: Props) {
  await params; // Consume params to satisfy TypeScript

  return (
    <div className="container mx-auto py-6">
      <PaymentPerformanceMonitor />
    </div>
  );
}
