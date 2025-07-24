'use client';

import { Button } from '@/components/ui/button';

export function PreOrderCtaSection() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 dark:bg-gray-950 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Don't Miss Out
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300 dark:text-gray-400">
            Secure your Rolitt today and be among the first to experience the
            future of companionship.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Pre-Order Now</Button>
            <a
              href="#faq"
              className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors"
            >
              Learn more
              {' '}
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
