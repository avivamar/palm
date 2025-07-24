'use client';

import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../AnimationContext';

type FloatingElementProps = {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
  rotate?: boolean;
  rotateAmplitude?: number;
} & MotionProps;

export function FloatingElement({
  children,
  className = '',
  amplitude = 10,
  duration = 4,
  delay = 0,
  rotate = false,
  rotateAmplitude = 3,
  ...props
}: FloatingElementProps) {
  const { prefersReducedMotion } = useAnimation();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0, amplitude, 0],
        rotate: rotate ? [-rotateAmplitude, 0, rotateAmplitude, 0, -rotateAmplitude] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
