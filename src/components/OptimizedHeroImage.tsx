'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type OptimizedHeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onError?: () => void;
  width?: number;
  height?: number;
};

export function OptimizedHeroImage({
  src,
  alt,
  className = '',
  priority = false,
  onError,
  width,
  height,
}: OptimizedHeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side hydration consistency
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded">
        <div className="text-white/50 text-xl">Discover Rolitt</div>
      </div>
    );
  }

  // Use fill only when width and height are not provided
  const useFill = !width && !height;

  // Show placeholder during SSR and when not priority
  if (!isClient || (!priority && !imageLoaded)) {
    return (
      <div className={`bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-pulse rounded ${useFill ? 'absolute inset-0' : ''}`}>
        <div className={`bg-[radial-gradient(circle_at_center,rgba(235,255,127,0.1)_0%,transparent_70%)] ${useFill ? 'absolute inset-0' : ''}`} />
      </div>
    );
  }

  // Common image props
  const commonProps = {
    src,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality: 75,
    className: `transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`,
  };

  return (
    <div className={`relative ${useFill ? 'w-full h-full' : ''}`}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className={`bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-pulse rounded ${useFill ? 'absolute inset-0' : ''}`}>
          <div className={`bg-[radial-gradient(circle_at_center,rgba(235,255,127,0.1)_0%,transparent_70%)] ${useFill ? 'absolute inset-0' : ''}`} />
        </div>
      )}

      {/* Optimized image with WebP support */}
      {useFill
        ? (
            <Image
              {...commonProps}
              loading={priority ? 'eager' : 'lazy'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              className={`object-cover ${commonProps.className}`}
            />
          )
        : (
            <Image
              {...commonProps}
              loading={priority ? 'eager' : 'lazy'}
              width={width || 24}
              height={height || 24}
            />
          )}
    </div>
  );
}
