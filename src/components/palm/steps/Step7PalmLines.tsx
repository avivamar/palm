'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { PalmUserData } from '@/stores/palmStore';

type Step7Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (type: string, data?: any) => void;
  experiments: Record<string, string>;
  sessionId: string;
};

export default function Step7PalmLines({
  updateUserData,
  trackEvent,
  goToNextStep,
}: Step7Props) {
  const [selectedLines, setSelectedLines] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('获取位置中...');

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (_position) => {
            setCurrentLocation('🌍 全球');
          },
          () => {
            setCurrentLocation('🌍 全球');
          },
        );
      } else {
        setCurrentLocation('🌍 全球');
      }
    };

    getLocation();
  }, []);

  const handleLineSelect = (lineType: string) => {
    setSelectedLines(lineType);

    trackEvent('palm_lines_select', {
      lineType,
      timestamp: Date.now(),
    });

    // 选择后立即更新数据并跳转到下一步
    updateUserData({ palmLines: lineType });
    trackEvent('palm_step7_complete', {
      palmLines: lineType,
    });
    goToNextStep();
  };

  const lineOptions = [
    {
      value: 'deep_clear',
      label: '深邃且清晰',
      icon: '🌟',
      bgColor: 'bg-purple-100',
    },
    {
      value: 'shallow_fragmented',
      label: '较浅/细碎',
      icon: '✨',
      bgColor: 'bg-blue-100',
    },
    {
      value: 'mixed_depth',
      label: '深浅混合',
      icon: '🔮',
      bgColor: 'bg-pink-100',
    },
    {
      value: 'unclear',
      label: '不太确定',
      icon: '❓',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">7</span>
          </div>
          <span className="text-gray-600 text-sm">手掌纹路观察</span>
        </div>
        <div className="text-xs text-gray-500">7/20</div>
      </header>

      {/* Progress bar */}
      <div className="px-4 pb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-violet-600 h-2 rounded-full" style={{ width: '35%' }}></div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-4 space-y-6">
        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800">
            观察你的手掌，
            <br />
            大部分纹路看起来像？
          </h1>
          <p className="text-gray-600 leading-snug">
            这将帮助我们更准确地分析你的掌纹特征
          </p>
        </motion.section>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {lineOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLineSelect(option.value)}
              className={`group w-full flex items-center justify-center py-4 rounded-xl border-2 transition ${
                selectedLines === option.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-transparent bg-white shadow hover:border-violet-400'
              }`}
            >
              <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mr-4`}>
                <span className="text-2xl">{option.icon}</span>
              </div>
              <span className="text-lg font-medium text-gray-800">{option.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* 移除继续按钮，用户选择后直接跳转 */}

        {/* Legal & location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的隐私政策、服务条款 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            <span>{currentLocation}</span>
            &nbsp;节点
          </p>
        </motion.div>
      </main>
    </div>
  );
}