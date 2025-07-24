'use client';

import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { motion, useAnimation as useFramerAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from '../../hooks/useIntersectionObserver';
import { useAnimation } from '../AnimationContext';

type ScrollRevealProps = {
  children: ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  staggerDirection?: 'forward' | 'reverse';
  variants?: any;
} & MotionProps;

export function ScrollReveal({
  children,
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.1,
  staggerDirection = 'forward',
  variants,
  ...props
}: ScrollRevealProps) {
  const { prefersReducedMotion } = useAnimation();
  const controls = useFramerAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
        staggerChildren,
        staggerDirection: staggerDirection === 'forward' ? 1 : -1,
      },
    },
  };

  const selectedVariants = variants || defaultVariants;

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [controls, inView, triggerOnce]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={selectedVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
