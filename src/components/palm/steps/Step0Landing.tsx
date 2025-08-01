'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step0Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step0Landing({ 
  trackEvent, 
  goToNextStep, 
  experiments 
}: Step0Props) {
  const [dailyCount, setDailyCount] = useState(486)
  const [freeSlots, setFreeSlots] = useState(23)
  
  useEffect(() => {
    // 记录页面访问
    trackEvent('palm_landing_view', { 
      variant: experiments['landing-version'],
      timestamp: Date.now()
    })
    
    // 动态更新今日分析人数
    const countInterval = setInterval(() => {
      setDailyCount(prev => prev + Math.floor(Math.random() * 5))
    }, 1800)
    
    // 动态稀缺性显示
    const updateFreeSlots = () => {
      const hour = new Date().getHours()
      const base = hour < 12 ? 47 : 23 // 上午显示更多名额
      const random = Math.floor(Math.random() * 8) + 1
      const slots = Math.max(base - random, 3) // 最少保持3个
      setFreeSlots(slots)
    }
    
    updateFreeSlots()
    const slotsInterval = setInterval(updateFreeSlots, 30000) // 每30秒更新一次
    
    // 添加实时活动通知
    const notificationTimer = setTimeout(() => {
      const notification = document.createElement('div')
      notification.className = 'fixed bottom-4 left-4 right-4 bg-white text-gray-800 p-3 rounded-lg shadow-lg text-sm animate-bounce z-50'
      notification.innerHTML = '🔔 刚刚有用户在北京完成了分析'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 5000)
    }, 8000)
    
    return () => {
      clearInterval(countInterval)
      clearInterval(slotsInterval)
      clearTimeout(notificationTimer)
    }
  }, [experiments])
  
  const handleCTAClick = () => {
    trackEvent('palm_cta_click', { 
      variant: experiments['landing-version'],
      freeSlots,
      dailyCount
    })
    goToNextStep()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-[390px] mx-auto px-4 pb-16">
        {/* Logo */}
        <header className="py-4 flex justify-center">
          <img src="/palm/img/logo.svg" alt="ThePalmistryLife" className="h-7" />
        </header>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex flex-col items-center rounded-xl border-2 border-violet-500 py-2 text-xs">
            <span className="font-bold text-violet-600">准确率 97.3%</span>
            <span className="text-gray-500">68.9万+用户验证</span>
          </div>

          <div className="flex flex-col items-center rounded-xl border-2 border-violet-500 py-2 text-xs">
            <span className="font-bold text-violet-600">
              <span>{dailyCount.toLocaleString()}</span> 人
            </span>
            <span className="text-gray-500">今日已分析</span>
          </div>
        </motion.div>

        {/* Hand visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mt-6 overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
        >
          <img
            src="/palm/img/demohand.png"
            alt="Palm Upload"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* sweeping gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent backdrop-blur-sm"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          />
        </motion.div>

        {/* Headings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center space-y-1"
        >
          <h1 className="text-2xl font-bold text-violet-600">
            3分钟发现你的财富天赋密码
          </h1>
          <h2 className="text-lg font-semibold text-gray-800">
            每天限定100人免费体验 · 已有689,234人改变财富轨迹
          </h2>
        </motion.section>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 flex justify-between text-violet-600 text-xs font-medium"
        >
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
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-7 w-full h-14 rounded-xl bg-violet-600 text-white text-lg font-semibold shadow-md hover:bg-violet-500 transition"
          onClick={handleCTAClick}
        >
          立即发现我的财富密码 →
        </motion.button>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-1 text-center text-[11px] text-gray-600"
        >
          <span>仅剩 {freeSlots} 个免费名额</span> · 完成分析仅需3分钟
        </motion.p>

        {/* Legal & location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <p className="mt-6 text-center text-[10px] leading-snug text-gray-400 px-4">
            继续即代表您同意我们的
            <a href="/privacy" className="underline">隐私政策</a>、
            <a href="/terms" className="underline">服务条款</a> 与追踪技术的使用。
          </p>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            全球节点智能分析
          </p>
        </motion.div>
      </main>
    </div>
  )
}