'use client';

import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { cn } from '@rolitt/shared/utils';

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

interface SparklesTextProps {
  className?: string;
  text: string;
  colors?: {
    first: string;
    second: string;
  };
  sparklesCount?: number;
  sparklesDensity?: number;
}

const SparklesText: React.FC<SparklesTextProps> = ({
  text,
  colors = { first: '#9FE2BF', second: '#FFBF9F' },
  className,
  sparklesCount = 10,
  sparklesDensity = 800,
  ...props
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSpark = (): Sparkle => ({
      id: `sparkle-${Date.now()}-${Math.random()}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: Math.random() > 0.5 ? colors.first : colors.second,
      delay: Math.random() * 2,
      scale: Math.random() * 1 + 0.3,
      lifespan: Math.random() * 10 + 5,
    });

    const initializeSparks = () => {
      const initialSparks = Array.from({ length: sparklesCount }, generateSpark);
      setSparkles(initialSparks);
    };

    const interval = setInterval(() => {
      setSparkles((currentSparks) => {
        const newSparks = currentSparks.map((spark) => {
          if (Math.random() > 0.8) {
            return generateSpark();
          }
          return spark;
        });
        return newSparks;
      });
    }, sparklesDensity);

    initializeSparks();

    return () => clearInterval(interval);
  }, [colors.first, colors.second, sparklesCount, sparklesDensity]);

  const sparkleElements = useMemo(
    () =>
      sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} {...sparkle} />
      )),
    [sparkles]
  );

  return (
    <div
      className={cn(
        'relative inline-block',
        className
      )}
      {...props}
    >
      <span className="relative z-10 font-bold">{text}</span>
      <span className="absolute inset-0">{sparkleElements}</span>
    </div>
  );
};

interface SparkleProps extends Sparkle {}

const Sparkle: React.FC<SparkleProps> = ({ id, x, y, color, delay, scale }) => {
  return (
    <svg
      key={id}
      className="pointer-events-none absolute z-20 animate-sparkle"
      style={
        {
          left: x,
          top: y,
          animationDelay: `${delay}s`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          transform: `scale(${scale})`,
        } as CSSProperties
      }
      width="21"
      height="21"
      viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
        fill={color}
      />
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}</style>
    </svg>
  );
};

export { SparklesText };