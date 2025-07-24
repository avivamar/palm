import { PageTransition } from '@/components/PageTransition';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { ScrollToTop } from '@/components/ScrollToTop';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollIndicator />
      <PageTransition>{children}</PageTransition>
      <ScrollToTop />
    </>
  );
}
