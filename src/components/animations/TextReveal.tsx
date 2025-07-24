'use client';

import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useIntersectionObserver';
import { useAnimation } from '../AnimationContext';

type TextRevealProps = {
  children: ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
  staggerChildren?: number;
  delay?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
};

export function TextReveal({
  children,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  staggerChildren = 0.03,
  delay = 0,
  duration = 0.5,
  as = 'div',
}: TextRevealProps) {
  const { prefersReducedMotion } = useAnimation();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  if (prefersReducedMotion) {
    const Component = as;
    return <Component className={className}>{children}</Component>;
  }

  // Convert children to string and split into words
  const text = children?.toString() || '';
  const words = text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: delay * i,
      },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  };

  const Component = motion[as] as any;

  return (
    <Component
      ref={ref}
      className={`${className} inline-block`}
      variants={container}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-1 whitespace-nowrap"
          variants={child}
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}
