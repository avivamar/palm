'use client';

import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../AnimationContext';

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
} & MotionProps;

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up',
  distance = 20,
  once = true,
  ...props
}: FadeInProps) {
  const { prefersReducedMotion } = useAnimation();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const initial = {
    opacity: 0,
    ...directionMap[direction],
  };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier curve for smooth easing
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
