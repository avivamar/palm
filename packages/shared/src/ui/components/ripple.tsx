'use client';

import React from 'react';
import { cn } from '@rolitt/shared/utils';

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
}: RippleProps) {
  return (
    <div
      className={cn(
        'pointer-events-none select-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]',
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = 5 + i * 5;

        return (
          <div
            key={i}
            className={`absolute animate-ripple rounded-full bg-foreground/25 shadow-xl border border-foreground`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: '1px',
                borderOpacity: `${borderOpacity}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
              } as React.CSSProperties
            }
          />
        );
      })}

      <style jsx>{`
        @keyframes ripple {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
        .animate-ripple {
          animation: ripple 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

export { Ripple };