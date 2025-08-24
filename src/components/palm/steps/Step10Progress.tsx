'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import type { ZodiacSign } from '@/libs/astrology/zodiac';
import type { PalmStepConfig } from '@/libs/palm/config';
import type { PalmUserData } from '@/stores/palmStore';

import { calculateZodiacSign } from '@/libs/astrology/zodiac';

type Step10Props = {
  userData: PalmUserData;
  updateUserData: (data: Partial<PalmUserData>) => void;
  goToNextStep: () => void;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  config: PalmStepConfig;
  locale: string;
  canProceed: boolean;
  sessionId: string;
  experiments: Record<string, any>;
};

const Step10Progress = ({
  userData,
  updateUserData: _updateUserData,
  goToNextStep,
  trackEvent: _trackEvent,
  config: _config,
  locale: _locale,
  canProceed: _canProceed,
  sessionId: _sessionId,
  experiments: _experiments,
}: Step10Props) => {
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [zodiacSign, setZodiacSign] = useState<ZodiacSign | null>(null);

  // Calculate zodiac sign from birth date
  useEffect(() => {
    if (userData.birthDate) {
      const sign = calculateZodiacSign(userData.birthDate);
      setZodiacSign(sign);
    }
  }, [userData.birthDate]);

  // Personalized status texts based on zodiac sign
  const getStatusTexts = () => {
    const baseTexts = [
      'Analyzing your palm lines...',
      'Processing hand geometry...',
      'Calculating life patterns...',
      'Generating insights...',
      'Finalizing your reading...',
    ];

    if (zodiacSign) {
      return [
        `Analyzing your ${zodiacSign.name} palm characteristics...`,
        `Processing ${zodiacSign.name} hand geometry patterns...`,
        `Calculating life patterns for ${zodiacSign.name}...`,
        `Generating ${zodiacSign.name}-specific insights...`,
        'Finalizing your personalized reading...',
      ];
    }

    return baseTexts;
  };

  const statusTexts = getStatusTexts();

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Status text animation
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setCurrentStatus((prev) => {
        if (prev >= statusTexts.length - 1) {
          clearInterval(statusInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(statusInterval);
  }, [statusTexts.length]);

  // Complete animation and proceed
  useEffect(() => {
    if (progress >= 100 && currentStatus >= statusTexts.length - 1) {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          goToNextStep();
        }, 2000);
      }, 1000);
    }
  }, [progress, currentStatus, statusTexts.length, goToNextStep]);

  const getCompletionMessage = () => {
    if (zodiacSign) {
      return `Your ${zodiacSign.name} palm analysis is complete! ${zodiacSign.element} energy flows through your hands, revealing unique insights about your destiny.`;
    }
    return 'Your palm analysis is complete! Unique insights about your destiny have been revealed.';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            {zodiacSign ? `${zodiacSign.name} Palm Analysis` : 'Palm Analysis'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-purple-200"
          >
            {zodiacSign
              ? `Analyzing your ${zodiacSign.name} characteristics and palm patterns...`
              : 'Analyzing your unique palm patterns...'}
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="w-full bg-purple-800/30 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <span>Progress</span>
            <span>
              {Math.round(progress)}
              %
            </span>
          </div>
        </div>

        {/* Status Text */}
        <motion.div
          key={currentStatus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          <p className="text-lg text-purple-100">
            {statusTexts[currentStatus] || statusTexts[0]}
          </p>
        </motion.div>

        {/* Zodiac Information */}
        {zodiacSign && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="bg-purple-800/20 rounded-lg p-4 text-center space-y-2"
          >
            <div className="text-2xl">{zodiacSign.symbol}</div>
            <div className="text-sm text-purple-200">
              {zodiacSign.element}
              {' • '}
              {zodiacSign.dateRange}
            </div>
            <div className="text-xs text-purple-300">
              {zodiacSign.traits.slice(0, 3).join(' • ')}
            </div>
          </motion.div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-4xl">✨</div>
            <p className="text-lg text-green-300 font-medium">
              {getCompletionMessage()}
            </p>
            <p className="text-sm text-purple-200">
              Redirecting to your results...
            </p>
          </motion.div>
        )}

        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step10Progress;