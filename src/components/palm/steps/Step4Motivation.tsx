'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { PalmUserData } from '@/stores/palmStore';

type Step4Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (type: string, data?: any) => void;
  experiments: Record<string, string>;
  sessionId: string;
};

export default function Step4Motivation({
  userData,
  updateUserData,
  trackEvent,
  goToNextStep,
}: Step4Props) {
  const [selectedMotivation, setSelectedMotivation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState('检测位置中…');

  useEffect(() => {
    trackEvent('palm_step4_view', {
      timestamp: Date.now(),
      profileData: {
        gender: userData.gender,
        energyType: userData.energyType,
        dominantHand: userData.dominantHand,
      },
    });

    // 获取用户粗略地理位置显示
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        setCurrentLocation(`${d.country_name || ''} ${d.region || ''}`);
      })
      .catch(() => {
        setCurrentLocation('');
      });
  }, [userData]);

  const handleMotivationSelect = (motivation: string) => {
    setSelectedMotivation(motivation);

    trackEvent('palm_motivation_select', {
      motivation,
      selected: true,
    });
  };

  const handleContinue = () => {
    if (selectedMotivation) {
      updateUserData({ motivations: [selectedMotivation] });
      trackEvent('palm_step4_complete', {
        selectedMotivation,
        profileComplete: 80,
      });
      goToNextStep();
    }
  };

  const motivationOptions = [
    {
      id: 'relationship',
      title: '了解我的关系和情感',
      description: '',
      icon: '💖',
      bgColor: 'bg-pink-100',
    },
    {
      id: 'intelligence',
      title: '深入了解我的智力和决策',
      description: '',
      icon: '🧠',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'health',
      title: '了解我的健康和活力前景',
      description: '',
      icon: '💪',
      bgColor: 'bg-green-100',
    },
    {
      id: 'career',
      title: '揭开关于我的职业和命运的见解',
      description: '',
      icon: '💼',
      bgColor: 'bg-yellow-100',
    },
    {
      id: 'curiosity',
      title: '普通的好奇心',
      description: '',
      icon: '🤔',
      bgColor: 'bg-purple-100',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-full max-w-[412px] px-4 pb-16">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Progress */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-8">
          <div className="h-full w-[80%] bg-violet-500 rounded-full transition-all"></div>
          <span className="absolute right-0 -top-6 text-xs text-gray-500">Step 4 / 5</span>
        </div>

        {/* Title */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <h1 className="text-2xl font-bold text-violet-600">您阅读手相的主要目的或好奇心是什么？</h1>
          <div className="mt-3 text-sm text-green-600 font-medium">
            🎯 个性化报告将基于你的选择深度定制
          </div>
        </motion.section>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-3 mb-8"
        >
          {motivationOptions.map((option, index) => {
            const isSelected = selectedMotivation === option.id;

            return (
              <motion.button
                key={option.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMotivationSelect(option.id)}
                className={`group w-full flex items-center py-4 px-4 rounded-xl border-2 transition ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-transparent bg-white shadow hover:border-violet-400'
                }`}
              >
                <div className={`w-12 h-12 ${option.bgColor} rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-2xl">{option.icon}</span>
                </div>
                <div className="text-left flex-1">
                  <span className="text-lg font-medium text-gray-800">{option.title}</span>
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center ml-2"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          onClick={handleContinue}
          disabled={!selectedMotivation}
          className={`w-full h-14 rounded-xl text-white text-lg font-semibold shadow-md transition ${
            selectedMotivation
              ? 'bg-violet-600 hover:bg-violet-500'
              : 'bg-violet-400 opacity-40 cursor-not-allowed'
          }`}
        >
          {!selectedMotivation
            ? '请选择一个选项'
            : '继续 →'
          }
        </motion.button>

        {/* Legal & location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的
            <Link href="/privacy" className="underline">隐私政策</Link>、
            <Link href="/terms" className="underline">服务条款</Link> 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            <span>{currentLocation}</span>&nbsp;节点
          </p>
        </motion.div>
      </main>
    </div>
  );
}