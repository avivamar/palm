'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAnimation } from '../AnimationContext';

type MouseFollowCursorProps = {
  size?: number;
  color?: string;
  opacity?: number;
  blur?: number;
  className?: string;
};

export function MouseFollowCursor({
  size = 40,
  color = 'rgba(235, 255, 127, 0.5)', // Rolitt brand color with opacity
  opacity = 1,
  blur = 10,
  className = '',
}: MouseFollowCursorProps) {
  const { prefersReducedMotion } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Add spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, prefersReducedMotion, size]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      className={`fixed pointer-events-none z-50 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        x: cursorXSpring,
        y: cursorYSpring,
        backgroundColor: color,
        opacity: isVisible ? opacity : 0,
        filter: `blur(${blur}px)`,
        transition: `opacity 0.3s ease`,
      }}
    />
  );
}
