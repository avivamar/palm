'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

type ConditionalLayoutProps = {
  children: React.ReactNode;
};

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path is admin route
  const isAdminRoute = pathname.includes('/admin');

  if (isAdminRoute) {
    // Admin routes: no navbar/footer, just children
    return <>{children}</>;
  }

  // Regular routes: include navbar and footer
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
