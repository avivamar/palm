'use client';

import { motion } from 'framer-motion';
import { useAnimation } from '../AnimationContext';
import { FloatingElement } from './FloatingElement';

type LoadingAnimationProps = {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  emoji?: string;
  className?: string;
};

export function LoadingAnimation({
  size = 'md',
  text = 'Loading...',
  emoji = '🤖',
  className = '',
}: LoadingAnimationProps) {
  const { prefersReducedMotion } = useAnimation();

  // 根据尺寸设置不同的大小
  const sizeClasses = {
    sm: 'h-10 w-10 text-2xl',
    md: 'h-16 w-16 text-4xl',
    lg: 'h-20 w-20 text-5xl',
  };

  // 如果用户偏好减少动画，则显示静态版本
  if (prefersReducedMotion) {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
          <span>{emoji}</span>
        </div>
        {text && <p className="text-lg font-medium">{text}</p>}
      </div>
    );
  }

  // 动画版本
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative">
        {/* 背景圆圈 */}
        <motion.div
          className={`rounded-full bg-primary/10 ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 浮动的emoji */}
        <FloatingElement
          className={`absolute inset-0 flex items-center justify-center ${sizeClasses[size]}`}
          amplitude={5}
          duration={2}
          rotate={true}
        >
          <span>{emoji}</span>
        </FloatingElement>

        {/* 旋转的光晕效果 */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary ${sizeClasses[size]}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* 加载文本 */}
      {text && (
        <motion.p
          className="text-lg font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
