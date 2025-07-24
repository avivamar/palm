'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Clock, Heart, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// 库存提醒组件
export function StockAlert() {
  const t = useTranslations('preOrder.realtime');
  const [stockCount, setStockCount] = useState(47);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟库存变化
      setStockCount((prev) => {
        const change = Math.random() > 0.7 ? -1 : 0;
        return Math.max(20, prev + change);
      });
    }, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-4 urgency-glow animate-pulse-enhanced"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="w-4 h-4 animate-wiggle" />
        <span className="animate-fade-in-up">{t('stockAlert', { count: stockCount })}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto text-white/80 hover:text-white transition-colors duration-200"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// 倒计时组件
export function CountdownTimer() {
  const t = useTranslations('preOrder.realtime');
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 25,
    seconds: 30,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // 重置倒计时
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 rounded-xl shadow-2xl mb-6 border border-gray-800 realtime-card"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-yellow-400 animate-spin-slow" />
          <span className="text-sm font-medium text-yellow-400 animate-fade-in-up">
            {t('countdownTitle')}
          </span>
        </div>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="bg-gradient-to-b from-red-400 to-red-600 text-white text-3xl font-bold px-3 py-2 rounded-lg shadow-lg animate-count-up">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{t('hours')}</div>
          </div>
          <div className="text-3xl font-bold text-red-400 animate-pulse">:</div>
          <div className="text-center">
            <div className="bg-gradient-to-b from-red-400 to-red-600 text-white text-3xl font-bold px-3 py-2 rounded-lg shadow-lg animate-count-up">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{t('minutes')}</div>
          </div>
          <div className="text-3xl font-bold text-red-400 animate-pulse">:</div>
          <div className="text-center">
            <div className="bg-gradient-to-b from-red-400 to-red-600 text-white text-3xl font-bold px-3 py-2 rounded-lg shadow-lg animate-count-up animate-heartbeat">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{t('seconds')}</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 mt-4 animate-fade-in-up">
          {t('countdownDescription')}
        </p>
      </div>
    </motion.div>
  );
}

// 实时用户活动组件
export function LiveUserActivity() {
  const t = useTranslations('preOrder.realtime');
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'view' | 'order';
    location: string;
    timeAgo: number;
  }>>([]);

  const locations = [
    'New York',
    'London',
    'Tokyo',
    'Paris',
    'Washington',
    'Berlin',
    'Toronto',
    'Singapore',
    'Hong Kong',
    'Seoul',
    'Taipei',
    'Los Angeles',
    'Manila',
    'Ho Chi Minh City',
    'Washington',
  ];

  useEffect(() => {
    const generateActivity = () => {
      const locationIndex = Math.floor(Math.random() * locations.length);
      const location = locations[locationIndex] || 'Unknown';

      const newActivity = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'order' : 'view' as 'view' | 'order',
        location,
        timeAgo: 0,
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    };

    // 初始化一些活动
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generateActivity(), i * 2000);
    }

    const interval = setInterval(generateActivity, 8000 + Math.random() * 7000);

    // 更新时间
    const timeInterval = setInterval(() => {
      setActivities(prev =>
        prev.map(activity => ({
          ...activity,
          timeAgo: activity.timeAgo + 1,
        })),
      );
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg mb-4 realtime-card hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse success-glow"></div>
        <span className="text-sm font-semibold text-gray-700">
          {t('liveActivityTitle')}
        </span>
        <div className="ml-auto">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activities.map(activity => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`flex items-center gap-3 py-3 px-2 text-sm rounded-lg mb-2 transition-all duration-200 ${
              activity.type === 'order'
                ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
                : 'bg-blue-50 border-l-4 border-blue-400 text-blue-800'
            }`}
          >
            <Users className={`w-4 h-4 ${
              activity.type === 'order' ? 'text-green-600' : 'text-blue-600'
            }`}
            />
            <div className="flex-1">
              <span className="font-medium">
                {activity.type === 'order'
                  ? t('activityOrder', { location: activity.location })
                  : t('activityView', { location: activity.location })}
              </span>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
              {activity.timeAgo === 0 ? t('justNow') : t('minutesAgo', { minutes: activity.timeAgo })}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {activities.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p>等待实时活动...</p>
        </div>
      )}
    </div>
  );
}

// 紧迫感横幅组件
export function UrgencyBanner() {
  const t = useTranslations('preOrder.realtime');
  const [isVisible, setIsVisible] = useState(true);
  const [currentOffer, setCurrentOffer] = useState(0);

  const offers = [
    'limitedStock',
    'earlyBirdEnding',
    'freeShipping',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % offers.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white py-4 px-6 text-center relative overflow-hidden urgency-banner animate-gradient-x">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

      {/* 闪烁效果背景 */}
      <div className="absolute inset-0 bg-white opacity-0 animate-flash"></div>

      {/* 装饰性元素 */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3">
        <AlertTriangle className="w-5 h-5 animate-wiggle" />
        <p className="text-sm font-bold tracking-wide animate-fade-in-up">
          {t(offers[currentOffer] || 'limitedStock')}
        </p>
        <AlertTriangle className="w-5 h-5 animate-wiggle" style={{ animationDelay: '0.2s' }} />
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-slide-in"></div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// 社交证明计数器
export function SocialProofCounter() {
  const t = useTranslations('preOrder.realtime');
  const [count, setCount] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setCount(prev => prev + 1);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg realtime-card hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Heart className="w-8 h-8 text-red-500 animate-heartbeat" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 animate-count-up">
              {count.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              {t('socialProofLabel')}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 font-medium animate-fade-in-up">
            {t('socialProofText')}
          </p>

          {/* 进度条效果 */}
          <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((count / 10000) * 100, 100)}%` }}
            >
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>10,000+</span>
          </div>
        </div>

        {/* 装饰性星星 */}
        <div className="flex justify-center gap-1 mt-3">
          {[...Array.from({ length: 5 })].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 text-yellow-400 animate-twinkle"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ⭐
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
