"use client";

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  src: string; // .lottie or .json file path
  fallbackVideoSrc?: string; // .webm fallback video
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function LottieAnimation({
  src,
  fallbackVideoSrc,
  loop = true,
  autoplay = true,
  className = "",
  width,
  height
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Try to load the Lottie animation
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }

        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [src]);

  // If loading, show a simple spinner
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there's an error and we have a fallback video, use it
  if (hasError && fallbackVideoSrc) {
    return (
      <video
        ref={videoRef}
        className={className}
        width={width}
        height={height}
        autoPlay={autoplay}
        loop={loop}
        muted
        playsInline
      >
        <source src={fallbackVideoSrc} type="video/webm" />
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </video>
    );
  }

  // If there's an error and no fallback, show a simple loading animation
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-pulse">
          <div className="rounded-full bg-primary/20 h-16 w-16"></div>
        </div>
      </div>
    );
  }

  // Render the Lottie animation
  return (
    <div className={className} style={{ width, height }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}