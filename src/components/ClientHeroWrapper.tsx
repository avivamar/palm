'use client';

import dynamic from 'next/dynamic';

// Dynamically import the StaticHero component with SSR disabled
const StaticHero = dynamic(() => import('@/components/StaticHero').then(mod => mod.StaticHero), {
  ssr: false,
  loading: () => (
    <div className="h-[30vh] md:h-[50vh] flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-48 mx-auto bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-64 mx-auto bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-56 mx-auto bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

export function ClientHeroWrapper() {
  return <StaticHero />;
}
