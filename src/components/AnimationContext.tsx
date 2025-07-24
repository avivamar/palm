'use client';

import type { ReactNode } from 'react';
import React, { createContext, use, useEffect, useState } from 'react';

type AnimationContextType = {
  prefersReducedMotion: boolean;
  isFirstVisit: boolean;
  setIsFirstVisit: (value: boolean) => void;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

type AnimationProviderProps = {
  children: ReactNode;
};

export function AnimationProvider({ children }: AnimationProviderProps) {
  // Initialize with default values that work during SSR
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Check if this is the first visit
    try {
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
      if (hasVisitedBefore) {
        setIsFirstVisit(false);
      } else {
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    } catch (error) {
      // Handle localStorage errors (e.g., in incognito mode)
      // Error accessing localStorage
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return (
    <AnimationContext
      value={{
        prefersReducedMotion,
        isFirstVisit,
        setIsFirstVisit,
      }}
    >
      {children}
    </AnimationContext>
  );
}

export function useAnimation() {
  const context = use(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
