'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Step5Props {
  userData?: any;
  updateUserData?: (data: any) => void;
  goToNextStep?: () => void;
  trackEvent?: (type: string, data?: any) => void;
  experiments?: Record<string, string>;
  locale?: string;
}

export default function Step5Encouragement({ 
  goToNextStep,
  trackEvent,
  locale = 'zh-HK'
}: Step5Props) {
  const router = useRouter();

  useEffect(() => {
    // 追踪鼓励页面访问
    trackEvent?.('encouragement_page_view', {
      step: 5,
      timestamp: Date.now()
    });

    // 自动跳转到下一步（3秒后）
    const timer = setTimeout(() => {
      if (goToNextStep) {
        goToNextStep();
      } else {
        router.push(`/${locale}/palm/flow/6`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [goToNextStep, trackEvent, router, locale]);

  const handleContinue = () => {
    trackEvent?.('encouragement_continue_clicked', {
      step: 5,
      timestamp: Date.now()
    });
    
    if (goToNextStep) {
      goToNextStep();
    } else {
      router.push(`/${locale}/palm/flow/6`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 星星装饰 */}
        <div className="absolute top-20 left-10 text-yellow-300 text-2xl animate-pulse">✨</div>
        <div className="absolute top-32 right-16 text-yellow-200 text-lg animate-pulse delay-300">⭐</div>
        <div className="absolute bottom-40 left-20 text-yellow-300 text-xl animate-pulse delay-700">✨</div>
        <div className="absolute top-60 left-1/3 text-yellow-200 text-sm animate-pulse delay-500">⭐</div>
        
        {/* 手掌轮廓装饰 */}
        <div className="absolute right-0 bottom-0 opacity-20">
          <svg width="300" height="400" viewBox="0 0 300 400" className="text-purple-300">
            <path d="M150 50 C120 60, 100 90, 110 130 L110 200 C110 220, 120 240, 140 250 L160 260 C180 270, 200 280, 210 300 L220 350 C225 370, 215 380, 200 375 L180 370 C160 365, 150 350, 145 330 L140 310 C135 290, 130 270, 125 250 L120 230 C115 210, 110 190, 115 170 L120 150 C125 130, 135 110, 150 100 Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* 魔法棒图标 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">🪄</div>
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-yellow-300 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 bg-yellow-200 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-1 h-1 bg-yellow-100 rounded-full"
            />
          </div>
        </motion.div>

        {/* 主标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          太棒了！你刚刚设定了你的第一个目标！
        </motion.h1>

        {/* 副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg text-purple-100 mb-12 max-w-sm leading-relaxed"
        >
          让我们继续深入，为你量身定制专属的财富方案
        </motion.p>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col space-y-4 w-full max-w-xs"
        >
          <button
            onClick={handleContinue}
            className="bg-white text-purple-700 font-semibold py-4 px-8 rounded-full hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            继续
          </button>
          
          <button
            onClick={handleContinue}
            className="bg-transparent border-2 border-white text-white font-semibold py-4 px-8 rounded-full hover:bg-white hover:text-purple-700 transition-all duration-300"
          >
            下一步
          </button>
        </motion.div>
      </div>
    </div>
  );
}