'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CONSENT_KEY = 'cookie-consent';

type CookieConsent = 'granted' | 'denied' | null;

type GtagWindow = Window & {
  gtag?: (
    command: 'consent',
    action: 'update',
    params: { analytics_storage: CookieConsent }
  ) => void;
};

declare const window: GtagWindow;

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleCookieConsent = (consent: CookieConsent) => {
    if (!consent) {
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, String(consent === 'granted'));
    }

    if (typeof window !== 'undefined') {
      window.gtag?.('consent', 'update', {
        analytics_storage: consent,
      });
    }

    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed left-4 bottom-4 z-50 max-w-sm animate-in slide-in-from-left-5 duration-300">
      <Card className="p-4 shadow-lg border bg-background/95 backdrop-blur-sm">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to improve your experience. By clicking "Accept", you agree to our Cookie Policy.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCookieConsent('denied')}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleCookieConsent('granted')}
              className="flex-1"
            >
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieBanner;
