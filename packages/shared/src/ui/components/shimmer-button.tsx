'use client';

import React from 'react';
import { cn } from '@rolitt/shared/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  children: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      borderRadius = '100px',
      shimmerDuration = '3s',
      background = 'rgba(0, 0, 0, 1)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
          } as React.CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] dark:text-black',
          'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className="absolute inset-0 overflow-visible [container-type:size]">
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* backdrop */}
        <div className="absolute inset-[var(--cut)] z-10 rounded-[calc(var(--radius)-var(--cut))] bg-[var(--bg)]" />

        {/* content */}
        <div className="z-20">{children}</div>

        <style jsx>{`
          @keyframes slide {
            to {
              transform: translate(calc(100cqw - 100%), 0);
            }
          }
          @keyframes spin-around {
            to {
              transform: rotate(360deg);
            }
          }
          .animate-slide {
            animation: slide var(--speed) ease-in-out infinite;
          }
          .animate-spin-around {
            animation: spin-around calc(var(--speed) * 2) linear infinite;
          }
        `}</style>
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

export { ShimmerButton };