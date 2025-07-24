'use client';

import type { ReactNode } from 'react';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import { useAnimation } from '../AnimationContext';

type LazyMotionWrapperProps = {
  children: ReactNode;
};

/**
 * 懒加载 Framer Motion 组件包装器
 * 只在需要时加载动画功能，减少初始 bundle 大小
 */
export function LazyMotionWrapper({ children }: LazyMotionWrapperProps) {
  const { prefersReducedMotion } = useAnimation();

  // 如果用户偏好减少动画，直接返回子组件而不加载动画库
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

// 导出优化的 motion 组件
export { m as motion };
