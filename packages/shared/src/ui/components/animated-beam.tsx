'use client';

import React, { forwardRef, useEffect, useId, useRef } from 'react';
import { cn } from '@rolitt/shared/utils';

export interface AnimatedBeamProps {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

export const AnimatedBeam = forwardRef<SVGSVGElement, AnimatedBeamProps>(
  (
    {
      className,
      containerRef,
      fromRef,
      toRef,
      curvature = 0,
      reverse = false,
      duration = Math.random() * 3 + 4,
      delay,
      pathColor = 'gray',
      pathWidth = 2,
      pathOpacity = 0.2,
      gradientStartColor = '#ffaa40',
      gradientStopColor = '#9c40ff',
      startXOffset = 0,
      startYOffset = 0,
      endXOffset = 0,
      endYOffset = 0,
    },
    ref
  ) => {
    const id = useId();
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    useEffect(() => {
      if (!containerRef.current || !fromRef.current || !toRef.current) {
        return;
      }

      const updatePath = () => {
        if (!containerRef.current || !fromRef.current || !toRef.current) {
          return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        const svgX = containerRect.left;
        const svgY = containerRect.top;

        // Calculate the center of each element relative to the container
        const startX = rectA.left - svgX + rectA.width / 2 + startXOffset;
        const startY = rectA.top - svgY + rectA.height / 2 + startYOffset;
        const endX = rectB.left - svgX + rectB.width / 2 + endXOffset;
        const endY = rectB.top - svgY + rectB.height / 2 + endYOffset;

        const controlPointX = startX + curvature;
        const controlPointY = startY - curvature;

        const d = `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
        pathRef.current?.setAttribute('d', d);
      };

      // Delay execution if specified
      const timeoutId = setTimeout(() => {
        updatePath();
      }, delay);

      const resizeObserver = new ResizeObserver(() => {
        updatePath();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    }, [
      containerRef,
      fromRef,
      toRef,
      curvature,
      startXOffset,
      startYOffset,
      endXOffset,
      endYOffset,
      delay,
    ]);

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        className={cn('pointer-events-none absolute left-0 top-0 h-full w-full', className)}
      >
        <defs>
          <linearGradient id={`${id}-gradient`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
            <stop offset="50%" stopColor={gradientStartColor} />
            <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`${id}-gradient-reverse`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={gradientStopColor} stopOpacity="0" />
            <stop offset="50%" stopColor={gradientStopColor} />
            <stop offset="100%" stopColor={gradientStartColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          fill="none"
          stroke={pathColor}
          strokeWidth={pathWidth}
          strokeOpacity={pathOpacity}
          strokeLinecap="round"
        />
        <path
          fill="none"
          stroke={`url(#${id}-gradient${reverse ? '-reverse' : ''})`}
          strokeWidth={pathWidth}
          strokeLinecap="round"
          strokeDasharray="20 20"
          className={cn(
            'animate-beam',
            reverse && 'animate-beam-reverse'
          )}
          style={{
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />

        <style jsx>{`
          @keyframes beam {
            to {
              stroke-dashoffset: -40;
            }
          }
          @keyframes beam-reverse {
            to {
              stroke-dashoffset: 40;
            }
          }
          .animate-beam {
            animation: beam 2s linear infinite;
          }
          .animate-beam-reverse {
            animation: beam-reverse 2s linear infinite;
          }
        `}</style>
      </svg>
    );
  }
);

AnimatedBeam.displayName = 'AnimatedBeam';