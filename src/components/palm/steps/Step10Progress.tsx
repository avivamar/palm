'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PalmUserData } from '@/stores/palmStore'

interface Step10Props {
  userData: PalmUserData
  updateUserData: (data: Partial<PalmUserData>) => void
  goToNextStep: () => void
  trackEvent: (type: string, data?: any) => void
  experiments: Record<string, string>
  sessionId: string
}

export default function Step10Progress({ 
  trackEvent, 
  goToNextStep 
}: Step10Props) {
  const [progress, setProgress] = useState(0)
  const [counter, setCounter] = useState(0)
  const [status, setStatus] = useState('开始分析...')
  const [isComplete, setIsComplete] = useState(false)
  
  const targetCounter = 847329 // 目标数字
  
  useEffect(() => {
    trackEvent('palm_progress_view', { 
      timestamp: Date.now(),
      step: 10
    })
    
    // 设置今天日期（在JSX中使用）
    
    // 动画进度条和计数器
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 3 + 1)
        if (next >= 100) {
          clearInterval(progressInterval)
          setProgress(100)
          setIsComplete(true)
          setStatus('分析完成！')
          setTimeout(() => {
            trackEvent('palm_progress_complete', { 
              duration: Date.now() - performance.now()
            })
            goToNextStep()
          }, 2000)
          return 100
        }
        return next
      })
    }, 150)
    
    // 计数器动画
    const counterInterval = setInterval(() => {
      setCounter(prev => {
        const increment = Math.floor(targetCounter / 100)
        const next = prev + increment
        if (next >= targetCounter) {
          clearInterval(counterInterval)
          return targetCounter
        }
        return next
      })
    }, 50)
    
    // 状态文字更新
    const statusTexts = [
      '开始分析...',
      '读取掌纹数据...',
      '分析生命线...',
      '计算财富指数...',
      '生成个性化建议...',
      '准备报告...',
      '分析完成！'
    ]
    
    let statusIndex = 0
    const statusInterval = setInterval(() => {
      if (statusIndex < statusTexts.length - 1) {
        statusIndex++
        const nextStatus = statusTexts[statusIndex]
        if (nextStatus) {
          setStatus(nextStatus)
        }
      }
    }, 2000)
    
    return () => {
      clearInterval(progressInterval)
      clearInterval(counterInterval)
      clearInterval(statusInterval)
    }
  }, []) // 移除依赖，避免无限循环
  
  // 计算圆形进度条的stroke-dashoffset
  const circumference = 2 * Math.PI * 40 // r=40
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#5E4BFB] via-[#6C63FF] to-[#9C6BFF] text-white">
      {/* 顶部导航 */}
      <header className="absolute top-4 left-4">
        <img src="/palm/img/logo.svg" className="h-6" alt="ThePalmistryLife" />
      </header>

      {/* 统计说明 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6 leading-snug"
      >
        我们已帮助 <span className="font-bold">{counter.toLocaleString()}</span> 位用户发现财富机会！<br/>
        <span className="text-xs text-white/70">
          *平均投资收益率提升3.7% | 截至 {new Date().toLocaleDateString('zh-CN')}
        </span>
      </motion.p>

      {/* SVG 圆环 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative mt-10 w-40 h-40"
      >
        <svg width="100%" height="100%">
          <circle cx="50%" cy="50%" r="40" stroke="#ffffff30" strokeWidth="8" fill="none"/>
          <circle 
            cx="50%" 
            cy="50%" 
            r="40"
            stroke="#ffffff" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.3s linear' }}
            transform="rotate(-90 80 80)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
          {Math.round(progress)} %
        </span>
      </motion.div>

      {/* 状态文字 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-lg font-medium">{status}</p>
        {!isComplete && (
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* 完成消息 */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="text-2xl mb-2">✨</div>
          <p className="text-lg font-semibold">您的财富报告已准备就绪！</p>
          <p className="text-sm text-white/80 mt-1">正在跳转到报告页面...</p>
        </motion.div>
      )}

      {/* 底部信息 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="absolute bottom-8 text-center text-sm text-white/60"
      >
        <p>分析基于AI算法和专业占星学原理</p>
      </motion.div>
    </div>
  )
}