'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Add spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handlePointerDetection = () => {
      const hoveredElement = document.querySelectorAll(':hover');
      const lastElement = hoveredElement[hoveredElement.length - 1];

      if (lastElement) {
        const computedStyle = window.getComputedStyle(lastElement);
        setIsPointer(computedStyle.cursor === 'pointer');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousemove', handlePointerDetection);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousemove', handlePointerDetection);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 rounded-full mix-blend-difference"
        style={{
          width: isPointer ? 40 : 20,
          height: isPointer ? 40 : 20,
          x: cursorXSpring,
          y: cursorYSpring,
          backgroundColor: '#EBFF7F',
          opacity: isVisible ? 1 : 0,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 40 : 20,
          height: isPointer ? 40 : 20,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      />

      {/* Outer cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 rounded-full border-2 border-primary mix-blend-difference"
        style={{
          width: isPointer ? 60 : 40,
          height: isPointer ? 60 : 40,
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isVisible ? 0.5 : 0,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isPointer ? 60 : 40,
          height: isPointer ? 60 : 40,
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
