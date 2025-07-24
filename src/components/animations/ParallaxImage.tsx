'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';
import { useAnimation } from '../AnimationContext';

type ParallaxImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  priority?: boolean;
};

export function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = '',
  speed = 0.2,
  direction = 'up',
  priority = false,
}: ParallaxImageProps) {
  const { prefersReducedMotion } = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Adjust the movement based on direction
  const factor = direction === 'up' ? -speed * 100 : speed * 100;

  const y = useTransform(scrollYProgress, [0, 1], [0, factor]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover"
          priority={priority}
        />
      </motion.div>
    </div>
  );
}
