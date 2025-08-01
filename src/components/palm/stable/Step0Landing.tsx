'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PalmStepConfig } from '@/libs/palm/config'

interface Step0Props {
  locale: string
  searchParams: Record<string, string | string[] | undefined>
  config: PalmStepConfig
}

export default function Step0Landing({ locale }: Step0Props) {
  useEffect(() => {
    // 动态更新今日分析人数
    const dailyCountEl = document.getElementById('dailyCount');
    if (dailyCountEl) {
      let num = 486;
      const interval = setInterval(() => {
        num += Math.floor(Math.random() * 5);
        dailyCountEl.textContent = num.toLocaleString();
      }, 1800);
      
      return () => clearInterval(interval);
    }
    return () => {}; // 确保总是返回一个清理函数
  }, []);

  useEffect(() => {
    // 动态稀缺性显示
    const freeSlotsEl = document.getElementById('freeSlots');
    if (freeSlotsEl) {
      const updateFreeSlots = () => {
        const hour = new Date().getHours();
        const base = hour < 12 ? 47 : 23; // 上午显示更多名额
        const random = Math.floor(Math.random() * 8) + 1;
        const slots = Math.max(base - random, 3); // 最少保持3个
        freeSlotsEl.textContent = `仅剩 ${slots} 个免费名额`;
      };
      
      updateFreeSlots();
      const interval = setInterval(updateFreeSlots, 30000); // 每30秒更新一次
      
      return () => clearInterval(interval);
    }
    return () => {}; // 确保总是返回一个清理函数
  }, []);

  useEffect(() => {
    // 添加实时活动通知（可选）
    const timer = setTimeout(() => {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 left-4 right-4 bg-white text-gray-800 p-3 rounded-lg shadow-lg text-sm animate-bounce z-50';
      notification.innerHTML = '🔔 刚刚有用户在北京完成了分析';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx>{`
        /* 扫描渐变：左→右 4s 无限 */
        @keyframes sweep {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        .sweep-animation {
          animation: sweep 4s infinite linear;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 flex justify-center">
        <main className="w-[390px] mx-auto px-4 pb-16">
          {/* Logo */}
          <header className="py-4 flex justify-center">
            <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
          </header>

          {/* Social proof */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-xl border-2 border-violet-500 py-2 text-xs">
              <span className="font-bold text-violet-600">准确率 97.3%</span>
              <span className="text-gray-500">68.9万+用户验证</span>
            </div>

            <div className="flex flex-col items-center rounded-xl border-2 border-violet-500 py-2 text-xs">
              <span className="font-bold text-violet-600">
                <span id="dailyCount">486</span> 人
              </span>
              <span className="text-gray-500">今日已分析</span>
            </div>
          </div>

          {/* Hand visual */}
          <div className="relative mt-6 overflow-hidden rounded-2xl shadow-lg aspect-[4/3]">
            <img
              src="/palm/img/demohand.png"
              alt="Palm Upload"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* sweeping gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent backdrop-blur-sm sweep-animation"></div>
          </div>

          {/* Headings */}
          <section className="mt-8 text-center space-y-1">
            <h1 className="text-2xl font-bold text-violet-600">
              3分钟发现你的财富天赋密码
            </h1>
            <h2 className="text-lg font-semibold text-gray-800">
              每天限定100人免费体验 · 已有689,234人改变财富轨迹
            </h2>
          </section>

          {/* Feature pills */}
          <div className="mt-6 flex justify-between text-violet-600 text-xs font-medium">
            <div className="flex flex-col items-center gap-1">
              <span>✓</span>
              <span>完全免费</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span>✓</span>
              <span>1分钟出结果</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span>✓</span>
              <span>隐私保护</span>
            </div>
          </div>

          {/* CTA */}
          <Link 
            href={`/${locale}/palm/stable/1`}
            className="mt-7 w-full h-14 rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-md hover:bg-violet-500 transition flex items-center justify-center"
          >
            立即发现我的财富密码 →
          </Link>
          
          <p className="mt-1 text-center text-[11px] text-gray-600">
            <span id="freeSlots">仅剩 23 个免费名额</span> · 完成分析仅需3分钟
          </p>

          {/* Legal & location */}
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的
            <a href="/privacy" className="underline">隐私政策</a>、
            <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            全球节点
          </p>
        </main>
      </div>
    </>
  )
}