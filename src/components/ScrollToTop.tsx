'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  const scrollYProgressSpring = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
  });

  const opacity = useTransform(
    scrollYProgressSpring,
    [0, 0.1],
    [0, 1],
  );

  const scale = useTransform(
    scrollYProgressSpring,
    [0, 0.1],
    [0.8, 1],
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      style={{ opacity, scale }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={scrollToTop}
        size="icon"
        className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}
